-- Keep the checked-in schema aligned with the production project.
-- Applications remain write-only to public clients; CVs and portfolios stay private.

alter table public.committee_registrations
  drop constraint if exists committee_registrations_email_address_check;

alter table public.committee_registrations
  drop column if exists experience;

alter table public.committee_registrations
  add constraint committee_registrations_email_address_check
  check (lower(email_address) like '%@my.cityu.edu.hk');

drop policy if exists "Public can submit committee applications"
  on public.committee_registrations;

create policy "Public can submit committee applications"
  on public.committee_registrations
  for insert
  to anon, authenticated
  with check (
    availability_acknowledged = true
    and char_length(full_name) between 1 and 120
    and char_length(motivation) between 40 and 2000
    and lower(email_address) like '%@my.cityu.edu.hk'
  );

drop policy if exists "Applicants can upload committee files" on storage.objects;

create policy "Applicants can upload committee files"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'committee-application-files'
    and name ~ '^[0-9a-fA-F-]{36}/(cv|portfolio)-[^/]+$'
  );
