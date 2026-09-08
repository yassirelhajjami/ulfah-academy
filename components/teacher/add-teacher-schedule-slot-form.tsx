"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { addTeacherScheduleSlotAction, type ActionResult } from "@/lib/actions/teacher";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function AddTeacherScheduleSlotForm({ dict, groupId }: { dict: Dictionary; groupId: string }) {
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => addTeacherScheduleSlotAction(formData),
    initialState
  );
  const t = dict.teacherPage.groupDetail.slotForm;
  const weekdays = dict.schedulePage.weekdays;
  const open = manuallyOpened && !state?.success;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setManuallyOpened(true)}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark"
      >
        {dict.teacherPage.groupDetail.addSlotButton}
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="groupId" value={groupId} />
      <h3 className="font-bold text-brand-green">{t.title}</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="weekday">
            {t.weekday}
          </label>
          <select id="weekday" name="weekday" defaultValue="0" className={inputClass}>
            {weekdays.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="startTime">
            {t.startTime}
          </label>
          <input id="startTime" name="startTime" type="time" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="endTime">
            {t.endTime}
          </label>
          <input id="endTime" name="endTime" type="time" required className={inputClass} />
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
