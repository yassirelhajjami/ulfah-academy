"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { AddMemorizationForm, type MemorizationRecord } from "./add-memorization-form";

export type MemorizationListItem = MemorizationRecord & {
  surah_name_ar: string;
  surah_name_en: string;
};

export function MemorizationSection({
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
  records: MemorizationListItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const t = dict.teacherPage.studentDetail;
  const nameKey = locale === "ar" ? "surah_name_ar" : "surah_name_en";

  return (
    <section className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-bold text-brand-green">{t.memorizationTitle}</h2>
      {records.length > 0 ? (
        <ul className="space-y-2">
          {records.map((m) =>
            editingId === m.id ? (
              <li key={m.id}>
                <AddMemorizationForm
                  dict={dict}
                  studentId={studentId}
                  surahs={surahs}
                  editing={m}
                  onDone={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 p-3 text-sm text-brand-dark/80"
              >
                <span>
                  {m[nameKey] ?? "—"} ({m.ayah_from}–{m.ayah_to}) · {m.status}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="shrink-0 text-xs font-medium text-brand-green/80 transition-colors hover:text-brand-green"
                >
                  {t.editButton}
                </button>
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="text-sm text-brand-dark/60">{t.noMemorization}</p>
      )}
      {editingId === null && <AddMemorizationForm dict={dict} studentId={studentId} surahs={surahs} />}
    </section>
  );
}
