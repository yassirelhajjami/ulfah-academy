-- =====================================================================
-- Fix protect_role_changes() to trust service_role requests.
--
-- Bug: the trigger reads `auth.uid()` to find the caller's own role, but
-- for a service_role request (e.g. an admin script, or any trusted
-- server-side job using SUPABASE_SERVICE_ROLE_KEY) auth.uid() is NULL —
-- there is no end-user JWT. That made caller_role resolve to NULL, which
-- fell through to the "else" branch and raised "Only admins can change
-- user roles" even for the service key, which is supposed to bypass RLS
-- and this kind of guard entirely. In practice this meant there was no
-- way to ever create the first admin account.
--
-- Fix: explicitly trust auth.role() = 'service_role' (Supabase's own
-- signal for "this request used the service key") before falling back to
-- the per-user caller_role lookup.
-- =====================================================================

create or replace function public.protect_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role public.user_role;
begin
  if new.role = old.role then
    return new;
  end if;

  if auth.role() = 'service_role' then
    return new;
  end if;

  select role into caller_role from public.profiles where id = auth.uid();

  if caller_role = 'super_admin' then
    return new;
  elsif caller_role = 'admin' then
    if new.role = 'super_admin' or old.role = 'super_admin' then
      raise exception 'Only super_admin can grant or revoke the super_admin role';
    end if;
    return new;
  else
    raise exception 'Only admins can change user roles';
  end if;
end;
$$;
