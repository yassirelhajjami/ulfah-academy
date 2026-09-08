-- =====================================================================
-- Maqraas (المقارئ) — organizational units/locations that contain
-- several groups (halaqat). A group optionally belongs to one maqraa.
-- =====================================================================

create table public.maqraas (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.groups
  add column maqraa_id uuid references public.maqraas (id) on delete set null;

alter table public.maqraas enable row level security;

-- Not sensitive (name/description only, no student data) — same reasoning
-- as the public groups/schedule read access in 0005.
create policy "maqraas_select_public_active"
  on public.maqraas for select
  using (is_active = true or public.is_admin());

create policy "maqraas_write_admin"
  on public.maqraas for insert
  with check (public.is_admin());

create policy "maqraas_update_admin"
  on public.maqraas for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "maqraas_delete_admin"
  on public.maqraas for delete
  using (public.is_admin());
