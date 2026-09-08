"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { AddRevisionForm, type RevisionRecord } from "./add-revision-form";

export type RevisionListItem = RevisionRecord & {
  surah_name_ar: string;
  surah_name_en: string;
};

export function RevisionSection({
  dict,
  locale,
  studentId,
  surahs,
  records,
}: {
  dict: Dictionary;
  locale: Locale;
  studentId: string;
  surahs: { id: number; name_ar: string; name_en: string }[];
  records: RevisionListItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const t = dict.teacherPage.studentDetail;
  const nameKey = locale === "ar" ? "surah_name_ar" : "surah_name_en";

  return (
    <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-bold text-brand-green">{t.revisionTitle}</h2>
      {records.length > 0 ? (
        <ul className="space-y-2">
          {records.map((r) =>
            editingId === r.id ? (
              <li key={r.id}>
                <AddRevisionForm
                  dict={dict}
                  studentId={studentId}
                  surahs={surahs}
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
                  {r[nameKey] ?? "—"} ({r.ayah_from}–{r.ayah_to}) · {r.revision_type}
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
        <p className="text-sm text-brand-dark/60">{t.noRevision}</p>
      )}
      {editingId === null && <AddRevisionForm dict={dict} studentId={studentId} surahs={surahs} />}
    </section>
  );
}
