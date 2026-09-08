-- =====================================================================
-- Oulfa Academy — public contact form messages
-- Same rationale as 0002_assessment_requests.sql: an anonymous website
-- visitor with no account yet, so this cannot reference profiles/students.
-- =====================================================================

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  locale      text not null default 'ar' check (locale in ('ar', 'en', 'fr')),
  status      text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  with check (true);

create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());

create policy "contact_messages_update_admin"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_delete_admin"
  on public.contact_messages for delete
  using (public.is_admin());
