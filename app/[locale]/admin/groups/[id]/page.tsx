import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { AddSessionForm } from "@/components/admin/add-session-form";
import { AddScheduleSlotForm } from "@/components/admin/add-schedule-slot-form";
import { DeleteItemButton } from "@/components/admin/delete-item-button";
import { deleteSessionAction, deleteScheduleSlotAction } from "@/lib/actions/admin";

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const { id } = await params;
  const t = dict.adminPage.groupDetail;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, capacity, teachers(profiles(full_name))")
    .eq("id", id)
    .single();

  if (!group) notFound();

  const teacherRow = group as unknown as {
    teachers: { profiles: { full_name: string } | null } | null;
  };

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, enrollment_status")
    .eq("group_id", id);

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, scheduled_at, meeting_url")
    .eq("group_id", id)
    .order("scheduled_at", { ascending: false })
    .limit(20);

  const { data: slots } = await supabase
    .from("group_schedule_slots")
    .select("id, weekday, start_time, end_time")
    .eq("group_id", id)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={localizedHref(locale, "/admin/groups")} className="text-sm font-medium text-brand-green hover:underline">
        ← {t.backToGroups}
      </Link>

      <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-brand-dark">{group.name}</h1>
        <p className="mt-1 text-sm text-brand-dark/60">
          {teacherRow.teachers?.profiles?.full_name ?? dict.adminPage.groups.noTeacher} · {group.capacity}{" "}
          {dict.adminPage.groups.studentsCount}
        </p>
      </div>

      <section className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.studentsTitle}</h2>
        {students && students.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {students.map((s) => (
              <li key={s.id} className="rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80">
                {s.full_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-brand-dark/60">{t.noStudents}</p>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.weeklyScheduleTitle}</h2>
        {slots && slots.length > 0 ? (
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80"
              >
                <span>
                  {dict.schedulePage.weekdays[slot.weekday]} · {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                </span>
                <DeleteItemButton
                  action={deleteScheduleSlotAction}
                  hiddenFields={{ slotId: slot.id, groupId: id, locale }}
                  label={t.deleteButton}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-brand-dark/60">{t.noWeeklySlots}</p>
        )}
        <AddScheduleSlotForm dict={dict} groupId={id} />
      </section>

      <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-bold text-brand-green">{t.sessionsTitle}</h2>
        {sessions && sessions.length > 0 && (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80"
              >
                <span>
                  {new Date(s.scheduled_at).toLocaleString(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {s.meeting_url && (
                    <>
                      {" · "}
                      <a
                        href={s.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand-green hover:underline"
                        dir="ltr"
                      >
                        Zoom
                      </a>
                    </>
                  )}
                </span>
                <DeleteItemButton
                  action={deleteSessionAction}
                  hiddenFields={{ sessionId: s.id, groupId: id, locale }}
                  label={t.deleteButton}
                />
              </li>
            ))}
          </ul>
        )}
        {(!sessions || sessions.length === 0) && <p className="text-sm text-brand-dark/60">{t.noSessions}</p>}
        <AddSessionForm dict={dict} groupId={id} />
      </section>
    </div>
  );
}
