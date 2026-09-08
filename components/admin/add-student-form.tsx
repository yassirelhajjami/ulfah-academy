"use client";

import { useActionState, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { addStudentAction } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/admin";
import { adminErrorMessage } from "./error-message";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function AddStudentForm({
  dict,
  locale,
  onCancel,
}: {
  dict: Dictionary;
  locale: Locale;
  onCancel: () => void;
}) {
  const [parentMode, setParentMode] = useState<"existing" | "new">("existing");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => addStudentAction(formData),
    initialState
  );
  const t = dict.adminPage.students.addForm;

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-brand-green text-white" : "text-brand-dark/70 hover:bg-brand-dark/5"
    }`;

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="parentMode" value={parentMode} />
      <h2 className="font-bold text-brand-green">{t.title}</h2>

      <div className="flex gap-1 rounded-lg bg-brand-dark/5 p-1">
        <button type="button" onClick={() => setParentMode("existing")} className={tabClass(parentMode === "existing")}>
          {t.existingParentTab}
        </button>
        <button type="button" onClick={() => setParentMode("new")} className={tabClass(parentMode === "new")}>
          {t.newParentTab}
        </button>
      </div>

      <div>
        <label className={labelClass} htmlFor="parentEmail">
          {t.parentEmail}
        </label>
        <input id="parentEmail" name="parentEmail" type="email" required dir="ltr" className={inputClass} />
      </div>

      {parentMode === "new" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="parentFullName">
              {t.parentFullName}
            </label>
            <input id="parentFullName" name="parentFullName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="parentTempPassword">
              {t.parentTempPassword}
            </label>
            <input
              id="parentTempPassword"
              name="parentTempPassword"
              type="text"
              required
              minLength={8}
              dir="ltr"
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div className="border-t border-brand-dark/10 pt-4">
        <label className={labelClass} htmlFor="childName">
          {t.childName}
        </label>
        <input id="childName" name="childName" required className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="dateOfBirth">
            {t.dateOfBirth}
          </label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="gender">
            {t.gender}
          </label>
          <select id="gender" name="gender" defaultValue="" className={inputClass}>
            <option value="">{t.genderUnspecified}</option>
            <option value="male">{t.genderMale}</option>
            <option value="female">{t.genderFemale}</option>
          </select>
        </div>
      </div>

      {state && !state.success && <p className="text-sm text-red-600">{adminErrorMessage(dict, state.error)}</p>}

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
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-full border border-brand-dark/15 px-6 py-2.5 text-sm font-semibold text-brand-dark/70 transition-colors hover:bg-brand-dark/5"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
