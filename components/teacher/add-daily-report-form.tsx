"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { addEvaluationAction, updateEvaluationAction, type ActionResult } from "@/lib/actions/teacher";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export type DailyReportRecord = {
  id: string;
  session_id: string;
  memorization_score: number | null;
  tajweed_score: number | null;
  revision_score: number | null;
  participation_score: number | null;
  notes: string | null;
};

export function AddDailyReportForm({
  dict,
  studentId,
  sessions,
  editing,
  onDone,
}: {
  dict: Dictionary;
  studentId: string;
  sessions: { id: string; label: string }[];
  editing?: DailyReportRecord | null;
  onDone?: () => void;
}) {
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      const result = editing ? await updateEvaluationAction(formData) : await addEvaluationAction(formData);
      if (result.success) onDone?.();
      return result;
    },
    initialState
  );
  const t = dict.teacherPage.studentDetail.dailyReportForm;
  const open = editing ? true : manuallyOpened && !state?.success;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setManuallyOpened(true)}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark"
      >
        {dict.teacherPage.studentDetail.addDailyReportButton}
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="studentId" value={studentId} />
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <h3 className="font-bold text-brand-green">{editing ? t.editTitle : t.title}</h3>

      <div>
        <label className={labelClass} htmlFor="sessionId">
          {t.session}
        </label>
        <select id="sessionId" name="sessionId" required defaultValue={editing?.session_id ?? ""} className={inputClass}>
          <option value="" disabled>
            —
          </option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="memorizationScore">
            {t.memorizationScore}
          </label>
          <input
            id="memorizationScore"
            name="memorizationScore"
            type="number"
            min={1}
            max={5}
            defaultValue={editing?.memorization_score ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="tajweedScore">
            {t.tajweedScore}
          </label>
          <input
            id="tajweedScore"
            name="tajweedScore"
            type="number"
            min={1}
            max={5}
            defaultValue={editing?.tajweed_score ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="revisionScore">
            {t.revisionScore}
          </label>
          <input
            id="revisionScore"
            name="revisionScore"
            type="number"
            min={1}
            max={5}
            defaultValue={editing?.revision_score ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="participationScore">
            {t.participationScore}
          </label>
          <input
            id="participationScore"
            name="participationScore"
            type="number"
            min={1}
            max={5}
            defaultValue={editing?.participation_score ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          {t.notes}
        </label>
        <textarea id="notes" name="notes" rows={3} defaultValue={editing?.notes ?? ""} className={inputClass} />
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
