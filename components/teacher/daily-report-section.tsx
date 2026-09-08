"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { AddDailyReportForm, type DailyReportRecord } from "./add-daily-report-form";

export type DailyReportListItem = DailyReportRecord & { session_label: string };

export function DailyReportSection({
  dict,
  studentId,
  sessions,
  records,
}: {
  dict: Dictionary;
  studentId: string;
  sessions: { id: string; label: string }[];
  records: DailyReportListItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const t = dict.teacherPage.studentDetail;

  const scoreSummary = (r: DailyReportListItem) =>
    [r.memorization_score, r.tajweed_score, r.revision_score, r.participation_score]
      .filter((v): v is number => v !== null)
      .join(" / ");

  return (
    <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-bold text-brand-green">{t.dailyReportsTitle}</h2>
      {records.length > 0 ? (
        <ul className="space-y-2">
          {records.map((r) =>
            editingId === r.id ? (
              <li key={r.id}>
                <AddDailyReportForm
                  dict={dict}
                  studentId={studentId}
                  sessions={sessions}
                  editing={r}
                  onDone={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80"
              >
                <span>
                  {r.session_label} · {scoreSummary(r) || "—"}
                  {r.notes ? ` · ${r.notes}` : ""}
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
        <p className="text-sm text-brand-dark/60">{t.noDailyReports}</p>
      )}
      {editingId === null && <AddDailyReportForm dict={dict} studentId={studentId} sessions={sessions} />}
    </section>
  );
}
