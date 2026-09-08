"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { AddWeeklyReportForm, type WeeklyReportRecord } from "./add-weekly-report-form";

export type WeeklyReportListItem = WeeklyReportRecord & { id: string };

export function WeeklyReportSection({
  dict,
  locale,
  studentId,
  reports,
}: {
  dict: Dictionary;
  locale: Locale;
  studentId: string;
  reports: WeeklyReportListItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const t = dict.teacherPage.studentDetail;

  return (
    <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-bold text-brand-green">{t.reportsTitle}</h2>
      {reports.length > 0 ? (
        <ul className="space-y-2">
          {reports.map((r) =>
            editingId === r.id ? (
              <li key={r.id}>
                <AddWeeklyReportForm dict={dict} studentId={studentId} editing={r} onDone={() => setEditingId(null)} />
              </li>
            ) : (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80"
              >
                <span>
                  {new Date(r.week_start).toLocaleDateString(locale, { dateStyle: "medium" })} — {r.new_ayahs_memorized}{" "}
                  {t.ayahsUnit}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingId(r.id)}
                  className="shrink-0 text-xs font-medium text-brand-green/80 transition-colors hover:text-brand-green"
                >
                  {t.editButton}
                </button>
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="text-sm text-brand-dark/60">{t.noReports}</p>
      )}
      {editingId === null && <AddWeeklyReportForm dict={dict} studentId={studentId} />}
    </section>
  );
}
