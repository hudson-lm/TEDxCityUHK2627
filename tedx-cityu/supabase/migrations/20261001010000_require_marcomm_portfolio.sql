-- Require a portfolio when either department preference is Creative or
-- Marketing and Communication. Availability remains enforced in the database
-- but is intentionally not exposed as a reviewer-facing tracking column.

alter table public.committee_registrations
  drop constraint if exists committee_registrations_creative_portfolio_required;

alter table public.committee_registrations
  drop constraint if exists committee_registrations_portfolio_required;

alter table public.committee_registrations
  add constraint committee_registrations_portfolio_required
  check (
    (
      first_choice not in ('Creative', 'Marketing and Communication')
      and coalesce(second_choice, '') not in ('Creative', 'Marketing and Communication')
    )
    or portfolio_storage_path is not null
  );
