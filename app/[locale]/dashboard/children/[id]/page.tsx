import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const { id } = await params;
  const t = dict.dashboardPage.childDetail;
  const supabase = await createClient();

  const { data: child } = await supabase
    .from("students")
    .select("id, full_name, date_of_birth, enrollment_status, group_id")
    .eq("id", id)
    .single();

  if (!child) notFound();

  const statusLabels = dict.dashboardPage.children.statusLabels as Record<string, string>;

  const { data: sessions } = child.group_id
    ? await supabase
        .from("class_sessions")
        .select("id, scheduled_at, status")
        .eq("group_id", child.group_id)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5)
    : { data: [] as { id: string; scheduled_at: string; status: string }[] };

  const { data: memorization } = await supabase
    .from("student_memorization")
    .select("id, surah_id, ayah_from, ayah_to, status, recorded_at")
    .eq("student_id", id)
    .order("recorded_at", { ascending: false })
    .limit(5);

  const { data: reports } = await supabase
    .from("weekly_reports")
    .select("id, week_start, week_end, sessions_attended, sessions_total, new_ayahs_memorized")
    .eq("student_id", id)
    .order("week_start", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={localizedHref(locale, "/dashboard/children")}
        className="text-sm font-medium text-brand-green hover:underline"
      >
        ← {t.backToChildren}
      </Link>

      <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-brand-dark">{child.full_name}</h1>
          <span className="shrink-0 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
            {statusLabels[child.enrollment_status] ?? child.enrollment_status}
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.scheduleTitle}</h2>
        {sessions && sessions.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {new Date(s.scheduled_at).toLocaleString(locale === "ar" ? "ar" : "en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-brand-dark/60">{t.noSchedule}</p>
        )}
      </section>

      <section className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.progressTitle}</h2>
        {memorization && memorization.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {memorization.map((m) => (
              <li key={m.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {t.progressNote} — {m.status}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-brand-dark/60">
            {t.noProgress} {t.progressNote}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.reportsTitle}</h2>
        {reports && reports.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {new Date(r.week_start).toLocaleDateString(locale === "ar" ? "ar" : "en", { dateStyle: "medium" })} —{" "}
                {r.sessions_attended}/{r.sessions_total}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-brand-dark/60">{t.noReports}</p>
        )}
      </section>
    </div>
  );
}
