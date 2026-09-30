-- Store applicant documents in a private bucket. The database records only
-- the private object paths; reviewers should access files through an
-- authenticated admin workflow or short-lived signed URLs.

alter table public.committee_registrations
  add column if not exists cv_storage_path text,
  add column if not exists portfolio_storage_path text;

alter table public.committee_registrations
  drop constraint if exists committee_registrations_creative_portfolio_required;

alter table public.committee_registrations
  add constraint committee_registrations_creative_portfolio_required
  check (
    (
      first_choice <> 'Creative'
      and coalesce(second_choice, '') <> 'Creative'
    )
    or portfolio_storage_path is not null
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'committee-application-files',
  'committee-application-files',
  false,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Applicants can upload committee files" on storage.objects;

create policy "Applicants can upload committee files"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'committee-application-files');

comment on column public.committee_registrations.cv_storage_path is
  'Private Supabase Storage object path for the applicant CV.';

comment on column public.committee_registrations.portfolio_storage_path is
  'Private Supabase Storage object path for the applicant portfolio.';
