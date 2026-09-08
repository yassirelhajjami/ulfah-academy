import { resolveLocale } from "@/lib/i18n/resolve";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await resolveLocale(params);
  const t = dict.adminPage.overview;
  const supabase = await createClient();

  const [parents, students, activeStudents, leadStudents, teachers, groups] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "parent"),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("enrollment_status", "active"),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("enrollment_status", "lead"),
    supabase.from("teachers").select("id", { count: "exact", head: true }),
    supabase.from("groups").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: t.totalParents, value: parents.count ?? 0 },
    { label: t.totalStudents, value: students.count ?? 0 },
    { label: t.activeStudents, value: activeStudents.count ?? 0 },
    { label: t.leadStudents, value: leadStudents.count ?? 0 },
    { label: t.totalTeachers, value: teachers.count ?? 0 },
    { label: t.totalGroups, value: groups.count ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-green">{t.title}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
            <p className="text-sm text-brand-dark/60">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-green">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
