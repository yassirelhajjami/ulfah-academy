import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button-link";

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.dashboardPage.overview;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  type ChildSummary = { id: string; full_name: string; group_id: string | null };

  const { data: links } = await supabase
    .from("parent_children")
    .select("students(id, full_name, group_id)")
    .eq("parent_id", user?.id ?? "");

  // Supabase infers embedded resources as arrays without generated DB types;
  // parent_children.student_id is a to-one FK, so this is actually a single
  // object per row (verified against the live schema).
  const rows = (links ?? []) as unknown as { students: ChildSummary | null }[];
  const myChildren = rows.flatMap((l) => (l.students ? [l.students] : []));

  const childIds = myChildren.map((c) => c.id);
  const groupIds = [...new Set(myChildren.map((c) => c.group_id).filter((g): g is string => !!g))];

  const { data: upcomingSessions } =
    groupIds.length > 0
      ? await supabase
          .from("class_sessions")
          .select("id, scheduled_at, group_id")
          .in("group_id", groupIds)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(1)
      : { data: [] as { id: string; scheduled_at: string; group_id: string }[] };

  const { data: latestReports } =
    childIds.length > 0
      ? await supabase
          .from("weekly_reports")
          .select("id, week_start, week_end, student_id")
          .in("student_id", childIds)
          .order("week_start", { ascending: false })
          .limit(1)
      : { data: [] as { id: string; week_start: string; week_end: string; student_id: string }[] };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-green">
          {t.welcomeBack}
          {"! 👋"}
        </h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-brand-dark/60">{t.childrenCountLabel}</p>
          <p className="mt-2 text-3xl font-bold text-brand-green">{myChildren.length}</p>
        </div>

        <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-brand-dark/60">{t.upcomingSessionTitle}</p>
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <p className="mt-2 text-sm font-medium text-brand-dark">
              {new Date(upcomingSessions[0].scheduled_at).toLocaleString(locale === "ar" ? "ar" : "en", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-brand-dark/60">{t.noUpcomingSession}</p>
          )}
        </div>

        <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-brand-dark/60">{t.latestReportTitle}</p>
          {latestReports && latestReports.length > 0 ? (
            <p className="mt-2 text-sm font-medium text-brand-dark">
              {new Date(latestReports[0].week_start).toLocaleDateString(locale === "ar" ? "ar" : "en", {
                dateStyle: "medium",
              })}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-brand-dark/60">{t.noReportsYet}</p>
          )}
        </div>
      </div>

      {myChildren.length === 0 ? (
        <div className="rounded-2xl bg-brand-green/5 p-8 text-center">
          <h2 className="text-lg font-bold text-brand-green">{t.noChildrenTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-dark/70">{t.noChildrenBody}</p>
          <div className="mt-5">
            <ButtonLink href={localizedHref(locale, "/dashboard/children")} variant="primary">
              {t.addChildCta}
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <ButtonLink href={localizedHref(locale, "/dashboard/children")} variant="outline">
            {t.viewChildren}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
