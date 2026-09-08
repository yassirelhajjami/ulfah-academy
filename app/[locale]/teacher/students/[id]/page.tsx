import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { AddMemorizationForm } from "@/components/teacher/add-memorization-form";
import { AddRevisionForm } from "@/components/teacher/add-revision-form";
import { AddWeeklyReportForm } from "@/components/teacher/add-weekly-report-form";

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const { id } = await params;
  const t = dict.teacherPage.studentDetail;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, group_id, groups(teacher_id)")
    .eq("id", id)
    .single();

  const studentRow = student as unknown as { id: string; full_name: string; group_id: string | null; groups: { teacher_id: string } | null } | null;

  if (!studentRow || studentRow.groups?.teacher_id !== user?.id) notFound();

  const [surahsResult, memorizationResult, revisionResult, reportsResult] = await Promise.all([
    supabase.from("quran_surahs").select("id, name_ar, name_en").order("id"),
    supabase
      .from("student_memorization")
      .select("id, surah_id, ayah_from, ayah_to, status, quran_surahs(name_ar, name_en)")
      .eq("student_id", id)
      .order("recorded_at", { ascending: false })
      .limit(10),
    supabase
      .from("student_revision")
      .select("id, surah_id, ayah_from, ayah_to, revision_type, quran_surahs(name_ar, name_en)")
      .eq("student_id", id)
      .order("recorded_at", { ascending: false })
      .limit(10),
    supabase
      .from("weekly_reports")
      .select("id, week_start, week_end, new_ayahs_memorized")
      .eq("student_id", id)
      .order("week_start", { ascending: false })
      .limit(10),
  ]);

  const surahs = surahsResult.data ?? [];
  const nameKey = locale === "ar" ? "name_ar" : "name_en";

  type MemoRow = {
    id: string;
    ayah_from: number;
    ayah_to: number;
    status: string;
    quran_surahs: { name_ar: string; name_en: string } | null;
  };
  const memorization = (memorizationResult.data ?? []) as unknown as MemoRow[];

  type RevisionRow = {
    id: string;
    ayah_from: number;
    ayah_to: number;
    revision_type: string;
    quran_surahs: { name_ar: string; name_en: string } | null;
  };
  const revision = (revisionResult.data ?? []) as unknown as RevisionRow[];

  const reports = reportsResult.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {studentRow.group_id && (
        <Link
          href={localizedHref(locale, `/teacher/groups/${studentRow.group_id}`)}
          className="text-sm font-medium text-brand-green hover:underline"
        >
          ← {t.backToGroup}
        </Link>
      )}

      <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-brand-dark">{studentRow.full_name}</h1>
      </div>

      <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.memorizationTitle}</h2>
        {memorization.length > 0 ? (
          <ul className="space-y-2">
            {memorization.map((m) => (
              <li key={m.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {m.quran_surahs?.[nameKey] ?? "—"} ({m.ayah_from}–{m.ayah_to}) · {m.status}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-brand-dark/60">{t.noMemorization}</p>
        )}
        <AddMemorizationForm dict={dict} studentId={id} surahs={surahs} />
      </section>

      <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.revisionTitle}</h2>
        {revision.length > 0 ? (
          <ul className="space-y-2">
            {revision.map((r) => (
              <li key={r.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {r.quran_surahs?.[nameKey] ?? "—"} ({r.ayah_from}–{r.ayah_to}) · {r.revision_type}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-brand-dark/60">{t.noRevision}</p>
        )}
        <AddRevisionForm dict={dict} studentId={id} surahs={surahs} />
      </section>

      <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.reportsTitle}</h2>
        {reports.length > 0 ? (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {new Date(r.week_start).toLocaleDateString(locale === "ar" ? "ar" : "en", { dateStyle: "medium" })} —{" "}
                {r.new_ayahs_memorized} {locale === "ar" ? "آية" : "ayahs"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-brand-dark/60">{t.noReports}</p>
        )}
        <AddWeeklyReportForm dict={dict} studentId={id} />
      </section>
    </div>
  );
}
