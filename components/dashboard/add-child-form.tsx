"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { addChildAction, type ActionResult } from "@/lib/actions/dashboard";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function AddChildForm({
  dict,
  locale,
  onCancel,
}: {
  dict: Dictionary;
  locale: Locale;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => addChildAction(formData),
    initialState
  );
  const t = dict.dashboardPage.children.form;

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <h2 className="font-bold text-brand-green">{t.title}</h2>

      <div>
        <label className={labelClass} htmlFor="fullName">
          {t.fullName}
        </label>
        <input id="fullName" name="fullName" required className={inputClass} />
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

      {state && !state.success && <p className="text-sm text-red-600">{dict.dashboardPage.errors.generic}</p>}

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
