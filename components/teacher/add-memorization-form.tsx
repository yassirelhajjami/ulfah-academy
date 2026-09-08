"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { addMemorizationAction, updateMemorizationAction, type ActionResult } from "@/lib/actions/teacher";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export type MemorizationRecord = {
  id: string;
  surah_id: number;
  ayah_from: number;
  ayah_to: number;
  status: string;
};

export function AddMemorizationForm({
  dict,
  studentId,
  surahs,
  editing,
  onDone,
}: {
  dict: Dictionary;
  studentId: string;
  surahs: { id: number; name_ar: string; name_en: string }[];
  editing?: MemorizationRecord | null;
  onDone?: () => void;
}) {
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      const result = editing ? await updateMemorizationAction(formData) : await addMemorizationAction(formData);
      if (result.success) onDone?.();
      return result;
    },
    initialState
  );
  const t = dict.teacherPage.studentDetail.memorizationForm;
  const open = editing ? true : manuallyOpened && !state?.success;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setManuallyOpened(true)}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark"
      >
        {dict.teacherPage.studentDetail.addMemorizationButton}
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="studentId" value={studentId} />
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <h3 className="font-bold text-brand-green">{editing ? t.editTitle : t.title}</h3>

      <div>
        <label className={labelClass} htmlFor="surahId">
          {t.surah}
        </label>
        <select id="surahId" name="surahId" required defaultValue={editing?.surah_id ?? ""} className={inputClass}>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="ayahFrom">
            {t.ayahFrom}
          </label>
          <input
            id="ayahFrom"
            name="ayahFrom"
            type="number"
            min={1}
            required
            defaultValue={editing?.ayah_from}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ayahTo">
            {t.ayahTo}
          </label>
          <input
            id="ayahTo"
            name="ayahTo"
            type="number"
            min={1}
            required
            defaultValue={editing?.ayah_to}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="status">
            {t.status}
          </label>
          <select id="status" name="status" defaultValue={editing?.status ?? "new"} className={inputClass}>
            <option value="new">{t.statusNew}</option>
            <option value="in_progress">{t.statusInProgress}</option>
            <option value="memorized">{t.statusMemorized}</option>
          </select>
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
          onClick={() => (editing ? onDone?.() : setManuallyOpened(false))}
          className="inline-flex items-center justify-center rounded-full border border-brand-dark/15 px-6 py-2.5 text-sm font-semibold text-brand-dark/70 transition-colors hover:bg-brand-dark/5"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
