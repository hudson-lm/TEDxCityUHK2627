-- CVs and portfolios are now submitted as reviewer-accessible URLs.
-- Keep the existing columns for compatibility with the live sync and checks.

comment on column public.committee_registrations.cv_storage_path is
  'Reviewer-accessible CV URL supplied by the applicant.';

comment on column public.committee_registrations.portfolio_storage_path is
  'Reviewer-accessible portfolio URL supplied by the applicant.';
