import { resolveLocale } from "@/lib/i18n/resolve";
import { createClient } from "@/lib/supabase/server";
import { GroupsPageClient, type GroupRow } from "@/components/admin/groups-page-client";

export default async function AdminGroupsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const supabase = await createClient();

  const [groupsResult, programsResult, levelsResult, teachersResult, maqraasResult] = await Promise.all([
    supabase.from("groups").select("id, name, capacity, teachers(profiles(full_name)), students(id)"),
    supabase.from("programs").select("id, name_ar, name_en").order("name_ar"),
    supabase.from("levels").select("id, program_id, name_ar, name_en, sort_order").order("sort_order"),
    supabase.from("teachers").select("id, profiles(full_name)"),
    supabase.from("maqraas").select("id, name").order("name"),
  ]);

  type RawGroup = {
    id: string;
    name: string;
    capacity: number;
    teachers: { profiles: { full_name: string } | null } | null;
    students: { id: string }[];
  };
  const rawGroups = (groupsResult.data ?? []) as unknown as RawGroup[];
  const groups: GroupRow[] = rawGroups.map((g) => ({
    id: g.id,
    name: g.name,
    capacity: g.capacity,
    teacher_name: g.teachers?.profiles?.full_name ?? null,
    student_count: g.students?.length ?? 0,
  }));

  type RawTeacher = { id: string; profiles: { full_name: string } | null };
  const rawTeachers = (teachersResult.data ?? []) as unknown as RawTeacher[];
  const teachers = rawTeachers.map((t) => ({ id: t.id, full_name: t.profiles?.full_name ?? "" }));

  return (
    <GroupsPageClient
      dict={dict}
      locale={locale}
      groups={groups}
      programs={programsResult.data ?? []}
      levels={levelsResult.data ?? []}
      teachers={teachers}
      maqraas={maqraasResult.data ?? []}
    />
  );
}
