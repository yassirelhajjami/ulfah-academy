import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.teacherPage.overview;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, students(id)")
    .eq("teacher_id", user?.id ?? "");

  type GroupRow = { id: string; name: string; students: { id: string }[] };
  const rows = (groups ?? []) as unknown as GroupRow[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-green">{t.title}</h1>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-brand-dark/10 bg-white p-10 text-center">
          <p className="text-sm text-brand-dark/60">{t.noGroups}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((group) => (
            <Link
              key={group.id}
              href={localizedHref(locale, `/teacher/groups/${group.id}`)}
              className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="font-semibold text-brand-dark">{group.name}</h3>
              <p className="mt-2 text-xs text-brand-dark/50">
                {group.students?.length ?? 0} {t.studentsCount}
              </p>
              <p className="mt-4 text-sm font-medium text-brand-green">{t.viewGroup} ←</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
