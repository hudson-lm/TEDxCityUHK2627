-- Portfolios are submitted as reviewer-accessible URLs rather than uploads.
-- Keep the existing column for compatibility with the live sync and constraint.

comment on column public.committee_registrations.portfolio_storage_path is
  'Reviewer-accessible portfolio URL supplied by the applicant.';
