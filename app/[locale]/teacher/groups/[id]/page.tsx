import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { AddTeacherSessionForm } from "@/components/teacher/add-teacher-session-form";
import { AttendanceForm } from "@/components/teacher/attendance-form";

export default async function TeacherGroupDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const { id } = await params;
  const t = dict.teacherPage.groupDetail;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, teacher_id")
    .eq("id", id)
    .single();

  if (!group || group.teacher_id !== user?.id) notFound();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("group_id", id);

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, scheduled_at, meeting_url")
    .eq("group_id", id)
    .order("scheduled_at", { ascending: true });

  const { data: upcomingSessions } = await supabase
    .from("class_sessions")
    .select("id, scheduled_at, meeting_url")
    .eq("group_id", id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1);

  const allSessions = sessions ?? [];
  const attendanceTarget = upcomingSessions?.[0] ?? allSessions[allSessions.length - 1] ?? null;

  let existingAttendance: Record<string, string> = {};
  if (attendanceTarget) {
    const { data: attendance } = await supabase
      .from("class_attendance")
      .select("student_id, status")
      .eq("session_id", attendanceTarget.id);
    existingAttendance = Object.fromEntries((attendance ?? []).map((a) => [a.student_id, a.status]));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={localizedHref(locale, "/teacher")} className="text-sm font-medium text-brand-green hover:underline">
        ← {t.backToGroups}
      </Link>

      <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-brand-dark">{group.name}</h1>
      </div>

      <section className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.studentsTitle}</h2>
        {students && students.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {students.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80"
              >
                <span>{s.full_name}</span>
                <Link
                  href={localizedHref(locale, `/teacher/students/${s.id}`)}
                  className="font-medium text-brand-green hover:underline"
                >
                  {t.viewStudent}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-brand-dark/60">{t.noStudents}</p>
        )}
      </section>

      {attendanceTarget && students && students.length > 0 && (
        <AttendanceForm
          dict={dict}
          groupId={id}
          sessionId={attendanceTarget.id}
          students={students}
          existing={existingAttendance}
        />
      )}

      <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.sessionsTitle}</h2>
        {allSessions.length > 0 ? (
          <ul className="space-y-2">
            {allSessions.map((s) => (
              <li key={s.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {new Date(s.scheduled_at).toLocaleString(locale === "ar" ? "ar" : "en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {s.meeting_url && (
                  <>
                    {" · "}
                    <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-green hover:underline" dir="ltr">
                      Zoom
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-brand-dark/60">{t.noSessions}</p>
        )}
        <AddTeacherSessionForm dict={dict} groupId={id} />
      </section>
    </div>
  );
}
