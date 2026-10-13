-- Close committee recruitment at 21 October 2026, 23:59 HKT.
-- The database cutoff prevents late submissions even if the client-side form is bypassed.

drop policy if exists "Public can submit committee applications"
  on public.committee_registrations;

create policy "Public can submit committee applications"
  on public.committee_registrations
  for insert
  to anon, authenticated
  with check (
    now() < timestamptz '2026-10-21 23:59:00+08'
    and availability_acknowledged = true
    and char_length(full_name) between 1 and 120
    and char_length(motivation) between 40 and 2000
    and lower(email_address) like '%@my.cityu.edu.hk'
  );
