-- Apply this migration to the Supabase project used by the website before
-- enabling the committee application page in production.

create table if not exists public.committee_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  preferred_name text check (preferred_name is null or char_length(preferred_name) <= 80),
  email_address text not null,
  phone_number text not null check (char_length(phone_number) between 1 and 30),
  student_id text not null check (char_length(student_id) between 1 and 30),
  programme text not null check (char_length(programme) between 1 and 160),
  year_of_study text not null check (year_of_study in (
    'Year 1', 'Year 2', 'Year 3', 'Year 4 or above', 'Postgraduate', 'Other'
  )),
  first_choice text not null check (first_choice in (
    'Curators', 'Creative', 'Technical', 'Marketing and Communication',
    'Human Resources', 'Finance and Sponsorship',
    'Event Management and Procurement', 'Speaker Relations'
  )),
  second_choice text check (second_choice is null or second_choice in (
    'Curators', 'Creative', 'Technical', 'Marketing and Communication',
    'Human Resources', 'Finance and Sponsorship',
    'Event Management and Procurement', 'Speaker Relations'
  )),
  motivation text not null check (char_length(motivation) between 40 and 2000),
  experience text check (experience is null or char_length(experience) <= 2000),
  availability_acknowledged boolean not null check (availability_acknowledged = true),
  constraint committee_registrations_different_choices
    check (second_choice is null or first_choice <> second_choice)
);

create unique index if not exists committee_registrations_email_address_key
  on public.committee_registrations (lower(email_address));

alter table public.committee_registrations enable row level security;

revoke all on table public.committee_registrations from anon, authenticated;
grant insert on table public.committee_registrations to anon, authenticated;

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
  );

comment on table public.committee_registrations is
  'Private applications submitted through the TEDxCityUHK committee recruitment form.';
