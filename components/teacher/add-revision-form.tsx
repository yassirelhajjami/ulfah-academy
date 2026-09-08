"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { addRevisionAction, type ActionResult } from "@/lib/actions/teacher";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function AddRevisionForm({
  dict,
  studentId,
  surahs,
}: {
  dict: Dictionary;
  studentId: string;
  surahs: { id: number; name_ar: string; name_en: string }[];
}) {
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => addRevisionAction(formData),
    initialState
  );
  const t = dict.teacherPage.studentDetail.revisionForm;
  const open = manuallyOpened && !state?.success;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setManuallyOpened(true)}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark"
      >
        {dict.teacherPage.studentDetail.addRevisionButton}
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="studentId" value={studentId} />
      <h3 className="font-bold text-brand-green">{t.title}</h3>

      <div>
        <label className={labelClass} htmlFor="surahId">
          {t.surah}
        </label>
        <select id="surahId" name="surahId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            —
          </option>
          {surahs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name_ar} — {s.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ayahFrom">
            {t.ayahFrom}
          </label>
          <input id="ayahFrom" name="ayahFrom" type="number" min={1} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ayahTo">
            {t.ayahTo}
          </label>
          <input id="ayahTo" name="ayahTo" type="number" min={1} required className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="revisionType">
            {t.type}
          </label>
          <select id="revisionType" name="revisionType" defaultValue="recent" className={inputClass}>
            <option value="recent">{t.typeRecent}</option>
            <option value="old">{t.typeOld}</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="qualityRating">
            {t.quality}
          </label>
          <input id="qualityRating" name="qualityRating" type="number" min={1} max={5} className={inputClass} />
        </div>
      </div>

      {state && !state.success && <p className="text-sm text-red-600">{dict.teacherPage.errors.generic}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? t.submitting : t.submit}
        </button>
        <button
          type="button"
          onClick={() => setManuallyOpened(false)}
          className="inline-flex items-center justify-center rounded-full border border-brand-dark/15 px-6 py-2.5 text-sm font-semibold text-brand-dark/70 transition-colors hover:bg-brand-dark/5"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
