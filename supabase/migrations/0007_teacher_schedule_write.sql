-- =====================================================================
-- Allow a teacher to manage the weekly recurring schedule slots of
-- their own group (previously admin-only). RLS policies for the same
-- command are OR'd together, so this adds to "schedule_write_admin"
-- rather than replacing it.
-- =====================================================================

create policy "schedule_write_teacher_own_group"
  on public.group_schedule_slots for all
  using (public.is_own_group(group_id))
  with check (public.is_own_group(group_id));
