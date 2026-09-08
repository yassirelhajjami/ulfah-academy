-- =====================================================================
-- Public read access to the weekly schedule of active groups.
--
-- groups/group_schedule_slots currently only grant SELECT to admins,
-- the group's own teacher, or a parent with a child already in that
-- group (see 0001's groups_select_involved / schedule_select_involved).
-- The marketing site's public "Schedule" page needs anonymous visitors
-- to see day/time/program/level for active groups too — none of those
-- columns are PII (no student data is exposed), so this is safe to open
-- up. RLS policies for the same command are OR'd together, so this adds
-- to the existing policies rather than replacing them.
-- =====================================================================

create policy "groups_select_public_active"
  on public.groups for select
  using (is_active = true);

create policy "schedule_select_public_active"
  on public.group_schedule_slots for select
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_schedule_slots.group_id and g.is_active = true
    )
  );
