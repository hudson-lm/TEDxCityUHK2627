-- Curators are not recruiting through the committee application form. Keep
-- historical rows intact while preventing all new applications from choosing
-- Curators as either preference.

alter table public.committee_registrations
  drop constraint if exists committee_registrations_first_choice_check;

alter table public.committee_registrations
  add constraint committee_registrations_first_choice_check
  check (first_choice in (
    'Creative', 'Technical', 'Marketing and Communication',
    'Human Resources', 'Finance and Sponsorship',
    'Event Management and Procurement', 'Speaker Relations'
  )) not valid;

alter table public.committee_registrations
  drop constraint if exists committee_registrations_second_choice_check;

alter table public.committee_registrations
  add constraint committee_registrations_second_choice_check
  check (second_choice is null or second_choice in (
    'Creative', 'Technical', 'Marketing and Communication',
    'Human Resources', 'Finance and Sponsorship',
    'Event Management and Procurement', 'Speaker Relations'
  )) not valid;
