-- =====================================================================
-- Oulfa Academy (أكاديمية أُلفة) — Initial schema
-- Target: Supabase (Postgres 15+)
-- Companion docs: docs/PRD.md, docs/database-schema.md
--
-- Sections:
--   1. Extensions
--   2. Enums
--   3. Core identity: profiles (+ auth.users trigger)
--   4. Academic structure: programs, levels, teachers, groups, schedule
--   5. Students & family
--   6. Assessments (pre-enrollment placement)
--   7. Classes & attendance
--   8. Quran reference data
--   9. Progress tracking: memorization, revision, tajweed, evaluations
--  10. Assignments
--  11. Weekly reports
--  12. Billing: plans, subscriptions, payments, invoices
--  13. Certificates
--  14. Gamification
--  15. Notifications & messaging
--  16. updated_at triggers
--  17. RLS helper functions
--  18. RLS enable + policies
--  19. Seed data (reference/example only — see notes inline)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;


-- ---------------------------------------------------------------------
-- 2. ENUMS
-- ---------------------------------------------------------------------
create type public.user_role as enum (
  'super_admin',
  'admin',
  'teacher',
  'parent',
  'student',
  'support',          -- reserved for V2
  'accountant',       -- reserved for V2
  'content_manager'   -- reserved for V2
);

create type public.gender as enum ('male', 'female');

create type public.enrollment_status as enum (
  'lead',                 -- registered interest, no assessment yet
  'pending_assessment',   -- assessment booked
  'active',               -- enrolled in a group
  'paused',
  'inactive'
);

create type public.assessment_status as enum (
  'pending', 'scheduled', 'completed', 'cancelled'
);

create type public.session_status as enum (
  'scheduled', 'ongoing', 'completed', 'cancelled'
);

create type public.attendance_status as enum (
  'present', 'absent', 'late', 'excused'
);

create type public.memorization_status as enum (
  'new', 'in_progress', 'memorized'
);

create type public.revision_type as enum ('recent', 'old');

create type public.assignment_status as enum (
  'pending', 'submitted', 'graded', 'late'
);

create type public.subscription_status as enum (
  'active', 'paused', 'cancelled', 'expired'
);

create type public.payment_status as enum (
  'pending', 'paid', 'failed', 'refunded'
);


-- ---------------------------------------------------------------------
-- 3. CORE IDENTITY: profiles
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null default 'parent',
  full_name   text not null,
  phone       text,
  avatar_url  text,
  locale      text not null default 'ar' check (locale in ('ar', 'en', 'fr')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with role and display info. One row per authenticated user.';

-- Auto-create a profile row whenever a new auth user signs up.
-- Role defaults to 'parent' (the only self-serve signup role); staff roles
-- are elevated manually by an admin after creation.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'locale', 'ar')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 4. ACADEMIC STRUCTURE
-- ---------------------------------------------------------------------
create table public.programs (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name_ar          text not null,
  name_en          text not null,
  description_ar   text,
  description_en   text,
  min_age          smallint,
  max_age          smallint,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create table public.levels (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs (id) on delete cascade,
  code        text not null,
  name_ar     text not null,
  name_en     text not null,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  unique (program_id, code)
);

create table public.teachers (
  id                uuid primary key references public.profiles (id) on delete cascade,
  bio_ar            text,
  bio_en            text,
  qualifications    text,
  years_experience  smallint,
  specialties       text[] not null default '{}',
  hired_at          date,
  is_active         boolean not null default true
);

comment on table public.teachers is 'Extra fields for a profile with role = teacher. id = profiles.id.';

create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  program_id  uuid references public.programs (id) on delete set null,
  level_id    uuid references public.levels (id) on delete set null,
  teacher_id  uuid references public.teachers (id) on delete set null,
  capacity    smallint not null default 8,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.groups is 'A "halaqah" (حلقة): a small teaching group with one teacher.';

create table public.group_schedule_slots (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time  time not null,
  end_time    time not null,
  timezone    text not null default 'UTC', -- placeholder; see PRD open decisions
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 5. STUDENTS & FAMILY
-- ---------------------------------------------------------------------
create table public.students (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid references public.profiles (id) on delete set null,
  full_name          text not null,
  date_of_birth      date not null,
  gender             public.gender,
  avatar_url         text,
  program_id         uuid references public.programs (id) on delete set null,
  level_id           uuid references public.levels (id) on delete set null,
  group_id           uuid references public.groups (id) on delete set null,
  enrollment_status  public.enrollment_status not null default 'lead',
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.students is 'The child. profile_id is only set for teens (13+) who get their own login.';

create table public.parent_children (
  id                  uuid primary key default gen_random_uuid(),
  parent_id           uuid not null references public.profiles (id) on delete cascade,
  student_id          uuid not null references public.students (id) on delete cascade,
  relationship        text not null default 'parent',
  is_primary_contact  boolean not null default true,
  created_at          timestamptz not null default now(),
  unique (parent_id, student_id)
);


-- ---------------------------------------------------------------------
-- 6. ASSESSMENTS (pre-enrollment placement)
-- ---------------------------------------------------------------------
create table public.assessments (
  id                     uuid primary key default gen_random_uuid(),
  student_id             uuid not null references public.students (id) on delete cascade,
  teacher_id             uuid references public.teachers (id) on delete set null,
  scheduled_at           timestamptz,
  status                 public.assessment_status not null default 'pending',
  reading_ability        text,
  memorized_surahs       text[] not null default '{}',
  studied_tajweed        boolean not null default false,
  recommended_level_id   uuid references public.levels (id) on delete set null,
  notes                  text,
  created_at             timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 7. CLASSES & ATTENDANCE
-- ---------------------------------------------------------------------
create table public.class_sessions (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null references public.groups (id) on delete cascade,
  scheduled_at      timestamptz not null,
  duration_minutes  smallint not null default 60,
  meeting_url       text,
  status            public.session_status not null default 'scheduled',
  created_at        timestamptz not null default now()
);

create table public.class_attendance (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.class_sessions (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  status      public.attendance_status not null default 'present',
  marked_by   uuid references public.profiles (id) on delete set null,
  marked_at   timestamptz not null default now(),
  unique (session_id, student_id)
);


-- ---------------------------------------------------------------------
-- 8. QURAN REFERENCE DATA
-- ---------------------------------------------------------------------
create table public.quran_surahs (
  id               smallint primary key, -- 1..114
  name_ar          text not null,
  name_en          text not null,
  ayah_count       smallint not null,
  revelation_type  text
);

comment on table public.quran_surahs is
  'Reference data. Only a handful of well-known rows are seeded below as an example — '
  'import the full 114-surah list from a verified source (e.g. Tanzil.net, Quran.com API) '
  'before going to production.';


-- ---------------------------------------------------------------------
-- 9. PROGRESS TRACKING
-- ---------------------------------------------------------------------
create table public.student_memorization (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students (id) on delete cascade,
  surah_id     smallint not null references public.quran_surahs (id),
  ayah_from    smallint not null,
  ayah_to      smallint not null,
  status       public.memorization_status not null default 'new',
  teacher_id   uuid references public.teachers (id) on delete set null,
  session_id   uuid references public.class_sessions (id) on delete set null,
  recorded_at  timestamptz not null default now(),
  check (ayah_to >= ayah_from)
);

create table public.student_revision (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.students (id) on delete cascade,
  surah_id       smallint not null references public.quran_surahs (id),
  ayah_from      smallint not null,
  ayah_to        smallint not null,
  revision_type  public.revision_type not null default 'recent',
  quality_rating smallint check (quality_rating between 1 and 5),
  teacher_id     uuid references public.teachers (id) on delete set null,
  session_id     uuid references public.class_sessions (id) on delete set null,
  recorded_at    timestamptz not null default now(),
  check (ayah_to >= ayah_from)
);

create table public.tajweed_rules (
  id           uuid primary key default gen_random_uuid(),
  name_ar      text not null,
  name_en      text not null,
  description  text,
  sort_order   smallint not null default 0
);

create table public.student_tajweed_progress (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students (id) on delete cascade,
  rule_id       uuid not null references public.tajweed_rules (id) on delete cascade,
  mastery_level smallint not null default 0 check (mastery_level between 0 and 100),
  assessed_by   uuid references public.teachers (id) on delete set null,
  assessed_at   timestamptz not null default now(),
  unique (student_id, rule_id)
);

create table public.evaluations (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references public.class_sessions (id) on delete cascade,
  student_id            uuid not null references public.students (id) on delete cascade,
  teacher_id            uuid references public.teachers (id) on delete set null,
  memorization_score    smallint check (memorization_score between 1 and 5),
  tajweed_score         smallint check (tajweed_score between 1 and 5),
  revision_score        smallint check (revision_score between 1 and 5),
  participation_score   smallint check (participation_score between 1 and 5),
  notes                 text,
  created_at            timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 10. ASSIGNMENTS
-- ---------------------------------------------------------------------
create table public.assignments (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references public.groups (id) on delete cascade,
  teacher_id   uuid references public.teachers (id) on delete set null,
  title        text not null,
  description  text,
  due_at       timestamptz,
  created_at   timestamptz not null default now()
);

create table public.assignment_submissions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments (id) on delete cascade,
  student_id     uuid not null references public.students (id) on delete cascade,
  status         public.assignment_status not null default 'pending',
  submitted_at   timestamptz,
  feedback       text,
  graded_by      uuid references public.teachers (id) on delete set null,
  unique (assignment_id, student_id)
);


-- ---------------------------------------------------------------------
-- 11. WEEKLY REPORTS
-- ---------------------------------------------------------------------
create table public.weekly_reports (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.students (id) on delete cascade,
  week_start          date not null,
  week_end            date not null,
  sessions_attended   smallint not null default 0,
  sessions_total      smallint not null default 0,
  new_ayahs_memorized smallint not null default 0,
  revision_score      numeric(5,2),
  tajweed_score       numeric(5,2),
  teacher_notes       text,
  next_week_goals     text,
  generated_by        uuid references public.profiles (id) on delete set null,
  sent_at             timestamptz,
  created_at          timestamptz not null default now(),
  unique (student_id, week_start)
);


-- ---------------------------------------------------------------------
-- 12. BILLING
-- ---------------------------------------------------------------------
create table public.subscription_plans (
  id                 uuid primary key default gen_random_uuid(),
  program_id         uuid references public.programs (id) on delete set null,
  name_ar            text not null,
  name_en            text not null,
  sessions_per_week  smallint not null,
  price              numeric(10,2) not null,
  currency           text not null default 'USD', -- placeholder; see PRD open decisions
  billing_cycle      text not null default 'monthly',
  is_active          boolean not null default true
);

create table public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references public.students (id) on delete cascade,
  plan_id            uuid references public.subscription_plans (id) on delete set null,
  status             public.subscription_status not null default 'active',
  start_date         date not null,
  end_date           date,
  next_billing_date  date,
  created_at         timestamptz not null default now()
);

create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  subscription_id     uuid not null references public.subscriptions (id) on delete cascade,
  amount              numeric(10,2) not null,
  currency            text not null,
  status              public.payment_status not null default 'pending',
  provider            text,
  provider_reference  text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

create table public.invoices (
  id               uuid primary key default gen_random_uuid(),
  payment_id       uuid not null references public.payments (id) on delete cascade,
  invoice_number   text unique not null,
  pdf_url          text,
  issued_at        timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 13. CERTIFICATES
-- ---------------------------------------------------------------------
create table public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.students (id) on delete cascade,
  program_id          uuid references public.programs (id) on delete set null,
  title_ar            text not null,
  title_en            text not null,
  certificate_number  text unique not null,
  qr_code_url         text,
  issued_at           timestamptz not null default now(),
  issued_by           uuid references public.profiles (id) on delete set null
);


-- ---------------------------------------------------------------------
-- 14. GAMIFICATION (schema ready; UI is V2)
-- ---------------------------------------------------------------------
create table public.student_points (
  student_id      uuid primary key references public.students (id) on delete cascade,
  xp_total        integer not null default 0,
  current_streak  smallint not null default 0,
  updated_at      timestamptz not null default now()
);

create table public.point_transactions (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students (id) on delete cascade,
  action_type  text not null,
  points       integer not null,
  occurred_at  timestamptz not null default now()
);

create table public.badges (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  name_ar      text not null,
  name_en      text not null,
  icon         text,
  description  text
);

create table public.student_badges (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students (id) on delete cascade,
  badge_id    uuid not null references public.badges (id) on delete cascade,
  awarded_at  timestamptz not null default now(),
  unique (student_id, badge_id)
);


-- ---------------------------------------------------------------------
-- 15. NOTIFICATIONS & MESSAGING
-- ---------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  data        jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table public.message_threads (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students (id) on delete cascade,
  parent_id   uuid not null references public.profiles (id) on delete cascade,
  teacher_id  uuid not null references public.teachers (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (student_id, parent_id, teacher_id)
);

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.message_threads (id) on delete cascade,
  sender_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 16. updated_at TRIGGERS
-- ---------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.students
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 17. RLS HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'teacher' from public.profiles where id = auth.uid()),
    false
  );
$$;

create function public.is_parent_of(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parent_children
    where student_id = p_student_id and parent_id = auth.uid()
  );
$$;

create function public.is_teacher_of(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    join public.groups g on g.id = s.group_id
    where s.id = p_student_id and g.teacher_id = auth.uid()
  );
$$;

create function public.is_own_group(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.groups where id = p_group_id and teacher_id = auth.uid()
  );
$$;


-- ---------------------------------------------------------------------
-- 18. RLS — ENABLE + POLICIES
-- ---------------------------------------------------------------------

-- profiles ------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Role changes (self-service or admin) are guarded by a trigger below rather
-- than by the RLS predicates above: inside a WITH CHECK clause a subquery
-- against the same table sees the row's *new* (already-applied) value, not
-- the pre-update value, so "old role vs new role" comparisons cannot be
-- expressed correctly at the RLS layer. A BEFORE UPDATE trigger has direct
-- access to OLD/NEW and is the correct place for this rule.
create function public.protect_role_changes()
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

create trigger protect_role_changes
  before update of role on public.profiles
  for each row execute function public.protect_role_changes();

-- programs / levels (public reference data, readable by any authenticated user)
alter table public.programs enable row level security;
alter table public.levels enable row level security;
alter table public.quran_surahs enable row level security;
alter table public.tajweed_rules enable row level security;
alter table public.badges enable row level security;

create policy "reference_select_authenticated" on public.programs for select using (auth.role() = 'authenticated');
create policy "reference_select_authenticated" on public.levels for select using (auth.role() = 'authenticated');
create policy "reference_select_authenticated" on public.quran_surahs for select using (auth.role() = 'authenticated');
create policy "reference_select_authenticated" on public.tajweed_rules for select using (auth.role() = 'authenticated');
create policy "reference_select_authenticated" on public.badges for select using (auth.role() = 'authenticated');

create policy "reference_write_admin" on public.programs for all using (public.is_admin()) with check (public.is_admin());
create policy "reference_write_admin" on public.levels for all using (public.is_admin()) with check (public.is_admin());
create policy "reference_write_admin" on public.quran_surahs for all using (public.is_admin()) with check (public.is_admin());
create policy "reference_write_admin" on public.tajweed_rules for all using (public.is_admin()) with check (public.is_admin());
create policy "reference_write_admin" on public.badges for all using (public.is_admin()) with check (public.is_admin());

-- teachers --------------------------------------------------------------
alter table public.teachers enable row level security;

create policy "teachers_select_public" on public.teachers for select using (auth.role() = 'authenticated');
create policy "teachers_update_self_or_admin" on public.teachers for update
  using (id = auth.uid() or public.is_admin());
create policy "teachers_write_admin" on public.teachers for insert with check (public.is_admin());
create policy "teachers_delete_admin" on public.teachers for delete using (public.is_admin());

-- groups / schedule -------------------------------------------------------
alter table public.groups enable row level security;
alter table public.group_schedule_slots enable row level security;

create policy "groups_select_involved" on public.groups for select
  using (
    public.is_admin()
    or teacher_id = auth.uid()
    or exists (
      select 1 from public.students s
      where s.group_id = groups.id and public.is_parent_of(s.id)
    )
  );
create policy "groups_write_admin" on public.groups for insert with check (public.is_admin());
create policy "groups_update_admin" on public.groups for update using (public.is_admin());
create policy "groups_delete_admin" on public.groups for delete using (public.is_admin());

create policy "schedule_select_involved" on public.group_schedule_slots for select
  using (public.is_admin() or public.is_own_group(group_id));
create policy "schedule_write_admin" on public.group_schedule_slots for all
  using (public.is_admin()) with check (public.is_admin());

-- students ----------------------------------------------------------------
alter table public.students enable row level security;

create policy "students_select_involved" on public.students for select
  using (public.is_admin() or public.is_parent_of(id) or public.is_teacher_of(id) or profile_id = auth.uid());

create policy "students_insert_parent_or_admin" on public.students for insert
  with check (public.is_admin() or public.current_role() = 'parent');
  -- a parent creates the initial "lead" row for their own child during
  -- registration, then immediately links it via parent_children (same
  -- transaction, enforced at the application layer).

create policy "students_update_admin_or_teacher" on public.students for update
  using (public.is_admin() or public.is_teacher_of(id));

create policy "students_delete_admin" on public.students for delete using (public.is_admin());

-- parent_children -----------------------------------------------------------
alter table public.parent_children enable row level security;

create policy "parent_children_select_involved" on public.parent_children for select
  using (public.is_admin() or parent_id = auth.uid());
create policy "parent_children_insert_self_or_admin" on public.parent_children for insert
  with check (public.is_admin() or parent_id = auth.uid());
create policy "parent_children_delete_admin" on public.parent_children for delete using (public.is_admin());

-- assessments -----------------------------------------------------------
alter table public.assessments enable row level security;

create policy "assessments_select_involved" on public.assessments for select
  using (public.is_admin() or public.is_parent_of(student_id) or teacher_id = auth.uid());
create policy "assessments_insert_involved" on public.assessments for insert
  with check (public.is_admin() or public.is_parent_of(student_id) or teacher_id = auth.uid());
create policy "assessments_update_admin_or_teacher" on public.assessments for update
  using (public.is_admin() or teacher_id = auth.uid())
  with check (public.is_admin() or teacher_id = auth.uid());
create policy "assessments_delete_admin" on public.assessments for delete using (public.is_admin());

-- class_sessions / attendance ---------------------------------------------
alter table public.class_sessions enable row level security;
alter table public.class_attendance enable row level security;

create policy "sessions_select_involved" on public.class_sessions for select
  using (
    public.is_admin()
    or public.is_own_group(group_id)
    or exists (select 1 from public.students s where s.group_id = class_sessions.group_id and public.is_parent_of(s.id))
  );
create policy "sessions_write_admin_or_teacher" on public.class_sessions for all
  using (public.is_admin() or public.is_own_group(group_id))
  with check (public.is_admin() or public.is_own_group(group_id));

create policy "attendance_select_involved" on public.class_attendance for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "attendance_write_admin_or_teacher" on public.class_attendance for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

-- memorization / revision / tajweed / evaluations --------------------------
alter table public.student_memorization enable row level security;
alter table public.student_revision enable row level security;
alter table public.student_tajweed_progress enable row level security;
alter table public.evaluations enable row level security;

create policy "memorization_select_involved" on public.student_memorization for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "memorization_write_admin_or_teacher" on public.student_memorization for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

create policy "revision_select_involved" on public.student_revision for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "revision_write_admin_or_teacher" on public.student_revision for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

create policy "tajweed_progress_select_involved" on public.student_tajweed_progress for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "tajweed_progress_write_admin_or_teacher" on public.student_tajweed_progress for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

create policy "evaluations_select_involved" on public.evaluations for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "evaluations_write_admin_or_teacher" on public.evaluations for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

-- assignments / submissions -------------------------------------------------
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;

create policy "assignments_select_involved" on public.assignments for select
  using (
    public.is_admin()
    or public.is_own_group(group_id)
    or exists (select 1 from public.students s where s.group_id = assignments.group_id and public.is_parent_of(s.id))
  );
create policy "assignments_write_admin_or_teacher" on public.assignments for all
  using (public.is_admin() or public.is_own_group(group_id))
  with check (public.is_admin() or public.is_own_group(group_id));

create policy "submissions_select_involved" on public.assignment_submissions for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "submissions_write_admin_or_teacher" on public.assignment_submissions for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

-- weekly_reports -------------------------------------------------------
alter table public.weekly_reports enable row level security;

create policy "weekly_reports_select_involved" on public.weekly_reports for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "weekly_reports_write_admin_or_teacher" on public.weekly_reports for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

-- billing: subscription_plans (public reference), subscriptions, payments, invoices
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;

create policy "plans_select_authenticated" on public.subscription_plans for select using (auth.role() = 'authenticated');
create policy "plans_write_admin" on public.subscription_plans for all using (public.is_admin()) with check (public.is_admin());

create policy "subscriptions_select_involved" on public.subscriptions for select
  using (public.is_admin() or public.is_parent_of(student_id));
create policy "subscriptions_write_admin" on public.subscriptions for all
  using (public.is_admin()) with check (public.is_admin());

create policy "payments_select_involved" on public.payments for select
  using (
    public.is_admin()
    or exists (select 1 from public.subscriptions sub where sub.id = payments.subscription_id and public.is_parent_of(sub.student_id))
  );
create policy "payments_write_admin" on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

create policy "invoices_select_involved" on public.invoices for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.payments p
      join public.subscriptions sub on sub.id = p.subscription_id
      where p.id = invoices.payment_id and public.is_parent_of(sub.student_id)
    )
  );
create policy "invoices_write_admin" on public.invoices for all
  using (public.is_admin()) with check (public.is_admin());

-- certificates -----------------------------------------------------------
alter table public.certificates enable row level security;

create policy "certificates_select_involved" on public.certificates for select
  using (public.is_admin() or public.is_parent_of(student_id));
create policy "certificates_write_admin" on public.certificates for all
  using (public.is_admin()) with check (public.is_admin());

-- gamification -----------------------------------------------------------
alter table public.student_points enable row level security;
alter table public.point_transactions enable row level security;
alter table public.student_badges enable row level security;

create policy "points_select_involved" on public.student_points for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "points_write_admin_or_teacher" on public.student_points for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

create policy "point_tx_select_involved" on public.point_transactions for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "point_tx_write_admin_or_teacher" on public.point_transactions for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

create policy "student_badges_select_involved" on public.student_badges for select
  using (public.is_admin() or public.is_teacher_of(student_id) or public.is_parent_of(student_id));
create policy "student_badges_write_admin_or_teacher" on public.student_badges for all
  using (public.is_admin() or public.is_teacher_of(student_id))
  with check (public.is_admin() or public.is_teacher_of(student_id));

-- notifications / messaging -----------------------------------------------
alter table public.notifications enable row level security;
alter table public.message_threads enable row level security;
alter table public.messages enable row level security;

create policy "notifications_select_own" on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());
create policy "notifications_update_own" on public.notifications for update
  using (user_id = auth.uid());
create policy "notifications_write_admin" on public.notifications for insert
  with check (public.is_admin());

create policy "threads_select_involved" on public.message_threads for select
  using (public.is_admin() or parent_id = auth.uid() or teacher_id = auth.uid());
create policy "threads_insert_involved" on public.message_threads for insert
  with check (public.is_admin() or parent_id = auth.uid() or teacher_id = auth.uid());

create policy "messages_select_involved" on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id and (t.parent_id = auth.uid() or t.teacher_id = auth.uid())
    )
  );
create policy "messages_insert_involved" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id and (t.parent_id = auth.uid() or t.teacher_id = auth.uid())
    )
  );


-- ---------------------------------------------------------------------
-- 19. SEED DATA (reference / example only)
-- ---------------------------------------------------------------------

-- Programs described in the PRD.
insert into public.programs (slug, name_ar, name_en, min_age, max_age) values
  ('foundation', 'تأسيس القرآن', 'Quran Foundation', 4, 6),
  ('memorization', 'تحفيظ القرآن', 'Quran Memorization', 6, 12),
  ('tajweed', 'القرآن والتجويد', 'Quran & Tajweed', 8, 15),
  ('islamic-studies', 'القرآن والعلوم الإسلامية', 'Quran & Islamic Studies', 13, 18);

-- Levels per program (A..D pattern from the PRD).
insert into public.levels (program_id, code, name_ar, name_en, sort_order)
select p.id, l.code, l.name_ar, l.name_en, l.sort_order
from public.programs p
cross join (values
  ('A', 'مبتدئ',       'Beginner',     1),
  ('B', 'قارئ',         'Reader',       2),
  ('C', 'حافظ جزئياً',   'Partial Hafiz', 3),
  ('D', 'متقدم',        'Advanced',     4)
) as l(code, name_ar, name_en, sort_order);

-- Quran surahs: EXAMPLE rows only (well-established, low-risk facts).
-- Replace with the full 114-row list from a verified source before production.
insert into public.quran_surahs (id, name_ar, name_en, ayah_count, revelation_type) values
  (1,   'الفاتحة', 'Al-Fatihah', 7, 'meccan'),
  (112, 'الإخلاص', 'Al-Ikhlas',  4, 'meccan'),
  (113, 'الفلق',   'Al-Falaq',   5, 'meccan'),
  (114, 'الناس',   'An-Nas',     6, 'meccan');

-- Example subscription plans (price/currency are placeholders, see PRD §10).
insert into public.subscription_plans (name_ar, name_en, sessions_per_week, price, currency)
values
  ('أساسي', 'Basic', 2, 0, 'USD'),
  ('قياسي', 'Standard', 3, 0, 'USD'),
  ('مميز', 'Premium', 4, 0, 'USD');
