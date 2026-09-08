"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { addWeeklyReportAction, type ActionResult } from "@/lib/actions/teacher";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function AddWeeklyReportForm({ dict, studentId }: { dict: Dictionary; studentId: string }) {
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => addWeeklyReportAction(formData),
    initialState
  );
  const t = dict.teacherPage.studentDetail.reportForm;
  const open = manuallyOpened && !state?.success;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setManuallyOpened(true)}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark"
      >
        {dict.teacherPage.studentDetail.addReportButton}
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="studentId" value={studentId} />
      <h3 className="font-bold text-brand-green">{t.title}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="weekStart">
            {t.weekStart}
          </label>
          <input id="weekStart" name="weekStart" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="weekEnd">
            {t.weekEnd}
          </label>
          <input id="weekEnd" name="weekEnd" type="date" required className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="sessionsAttended">
            {t.sessionsAttended}
          </label>
          <input id="sessionsAttended" name="sessionsAttended" type="number" min={0} defaultValue={0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="sessionsTotal">
            {t.sessionsTotal}
          </label>
          <input id="sessionsTotal" name="sessionsTotal" type="number" min={0} defaultValue={0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="newAyahsMemorized">
            {t.newAyahs}
          </label>
          <input id="newAyahsMemorized" name="newAyahsMemorized" type="number" min={0} defaultValue={0} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="revisionScore">
            {t.revisionScore}
          </label>
          <input id="revisionScore" name="revisionScore" type="number" min={0} max={100} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="tajweedScore">
            {t.tajweedScore}
          </label>
          <input id="tajweedScore" name="tajweedScore" type="number" min={0} max={100} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="teacherNotes">
          {t.teacherNotes}
        </label>
        <textarea id="teacherNotes" name="teacherNotes" rows={3} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="nextWeekGoals">
          {t.nextWeekGoals}
        </label>
        <textarea id="nextWeekGoals" name="nextWeekGoals" rows={2} className={inputClass} />
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
