-- =====================================================================
-- Oulfa Academy — public assessment/lead requests
--
-- Why a separate table from public.assessments (0001):
-- public.assessments assumes an authenticated parent already linked to a
-- public.students row (public.is_parent_of). The marketing site's "احجز
-- تقييم" form is filled out by anonymous visitors who have no account yet.
-- This table captures that raw inquiry; an admin later converts a
-- qualified request into a real students + parent_children + assessments
-- record once the family actually registers.
-- =====================================================================

create table public.assessment_requests (
  id                       uuid primary key default gen_random_uuid(),
  parent_name              text not null,
  parent_email             text not null,
  parent_phone             text,
  child_name               text not null,
  child_age                smallint not null check (child_age between 2 and 20),
  -- free-text slug (e.g. 'foundation'), not a FK: the marketing site's
  -- program list is static copy (lib/i18n/dictionaries) shown to anonymous
  -- visitors, decoupled from whatever rows currently exist in public.programs.
  preferred_program_slug   text,
  reading_ability          text,
  memorized_surahs         text,
  preferred_contact_time   text,
  message                  text,
  locale                   text not null default 'ar' check (locale in ('ar', 'en', 'fr')),
  status                   text not null default 'new'
                             check (status in ('new', 'contacted', 'scheduled', 'converted', 'closed')),
  created_at               timestamptz not null default now()
);

comment on table public.assessment_requests is
  'Anonymous public inquiries from the marketing site "Book an Assessment" form. Staff-only visibility; converted manually into students/assessments once a family registers.';

alter table public.assessment_requests enable row level security;

-- Anyone (including anonymous visitors, i.e. the anon key) may submit a
-- request — this is a public lead form, not an authenticated feature.
create policy "assessment_requests_insert_public"
  on public.assessment_requests for insert
  with check (true);

-- Only staff can ever read, update, or delete requests — a submitter never
-- gets read access to their own row (there is no session to scope it to).
create policy "assessment_requests_select_admin"
  on public.assessment_requests for select
  using (public.is_admin());

create policy "assessment_requests_update_admin"
  on public.assessment_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "assessment_requests_delete_admin"
  on public.assessment_requests for delete
  using (public.is_admin());
