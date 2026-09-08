import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { MemorizationSection, type MemorizationListItem } from "@/components/teacher/memorization-section";
import { RevisionSection, type RevisionListItem } from "@/components/teacher/revision-section";
import { DailyReportSection, type DailyReportListItem } from "@/components/teacher/daily-report-section";
import { WeeklyReportSection, type WeeklyReportListItem } from "@/components/teacher/weekly-report-section";

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

  const [surahsResult, memorizationResult, revisionResult, reportsResult, evaluationsResult, sessionsResult] = await Promise.all([
    supabase.from("quran_surahs").select("id, name_ar, name_en").order("id"),
    supabase
      .from("student_memorization")
      .select("id, surah_id, ayah_from, ayah_to, status, quran_surahs(name_ar, name_en)")
      .eq("student_id", id)
      .order("recorded_at", { ascending: false })
      .limit(10),
    supabase
      .from("student_revision")
      .select("id, surah_id, ayah_from, ayah_to, revision_type, quality_rating, quran_surahs(name_ar, name_en)")
      .eq("student_id", id)
      .order("recorded_at", { ascending: false })
      .limit(10),
    supabase
      .from("weekly_reports")
      .select(
        "id, week_start, week_end, sessions_attended, sessions_total, new_ayahs_memorized, revision_score, tajweed_score, teacher_notes, next_week_goals"
      )
      .eq("student_id", id)
      .order("week_start", { ascending: false })
      .limit(10),
    supabase
      .from("evaluations")
      .select(
        "id, session_id, memorization_score, tajweed_score, revision_score, participation_score, notes, class_sessions(scheduled_at)"
      )
      .eq("student_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    studentRow.group_id
      ? supabase
          .from("class_sessions")
          .select("id, scheduled_at")
          .eq("group_id", studentRow.group_id)
          .order("scheduled_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] as { id: string; scheduled_at: string }[] }),
  ]);

  const surahs = surahsResult.data ?? [];

  type MemoRow = {
    id: string;
    surah_id: number;
    ayah_from: number;
    ayah_to: number;
    status: string;
    quran_surahs: { name_ar: string; name_en: string } | null;
  };
  const memorization: MemorizationListItem[] = ((memorizationResult.data ?? []) as unknown as MemoRow[]).map((m) => ({
    id: m.id,
    surah_id: m.surah_id,
    ayah_from: m.ayah_from,
    ayah_to: m.ayah_to,
    status: m.status,
    surah_name_ar: m.quran_surahs?.name_ar ?? "—",
    surah_name_en: m.quran_surahs?.name_en ?? "—",
  }));

  type RevisionRow = {
    id: string;
    surah_id: number;
    ayah_from: number;
    ayah_to: number;
    revision_type: string;
    quality_rating: number | null;
    quran_surahs: { name_ar: string; name_en: string } | null;
  };
  const revision: RevisionListItem[] = ((revisionResult.data ?? []) as unknown as RevisionRow[]).map((r) => ({
    id: r.id,
    surah_id: r.surah_id,
    ayah_from: r.ayah_from,
    ayah_to: r.ayah_to,
    revision_type: r.revision_type,
    quality_rating: r.quality_rating,
    surah_name_ar: r.quran_surahs?.name_ar ?? "—",
    surah_name_en: r.quran_surahs?.name_en ?? "—",
  }));

  const reports: WeeklyReportListItem[] = reportsResult.data ?? [];

  type EvalRow = {
    id: string;
    session_id: string;
    memorization_score: number | null;
    tajweed_score: number | null;
    revision_score: number | null;
    participation_score: number | null;
    notes: string | null;
    class_sessions: { scheduled_at: string } | null;
  };
  const evaluations: DailyReportListItem[] = ((evaluationsResult.data ?? []) as unknown as EvalRow[]).map((e) => ({
    id: e.id,
    session_id: e.session_id,
    memorization_score: e.memorization_score,
    tajweed_score: e.tajweed_score,
    revision_score: e.revision_score,
    participation_score: e.participation_score,
    notes: e.notes,
    session_label: e.class_sessions
      ? new Date(e.class_sessions.scheduled_at).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
      : "—",
  }));

  const sessionOptions = (sessionsResult.data ?? []).map((s) => ({
    id: s.id,
    label: new Date(s.scheduled_at).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }),
  }));

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

      <MemorizationSection dict={dict} locale={locale} studentId={id} surahs={surahs} records={memorization} />

      <RevisionSection dict={dict} locale={locale} studentId={id} surahs={surahs} records={revision} />

      <DailyReportSection dict={dict} studentId={id} sessions={sessionOptions} records={evaluations} />

      <WeeklyReportSection dict={dict} locale={locale} studentId={id} reports={reports} />
    </div>
  );
}
