"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { updateProfileAction, type ActionResult } from "@/lib/actions/dashboard";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function AccountForm({
  dict,
  locale,
  email,
  fullName,
  phone,
  roleLabel,
}: {
  dict: Dictionary;
  locale: Locale;
  email: string;
  fullName: string;
  phone: string;
  roleLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => updateProfileAction(formData),
    initialState
  );
  const t = dict.dashboardPage.account;

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-8">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className={labelClass}>{t.email}</label>
        <input value={email} disabled dir="ltr" className={`${inputClass} bg-brand-dark/5 text-brand-dark/50`} />
        <p className="mt-1 text-xs text-brand-dark/50">{t.emailNote}</p>
      </div>

      <div>
        <label className={labelClass}>{t.role}</label>
        <input value={roleLabel} disabled className={`${inputClass} bg-brand-dark/5 text-brand-dark/50`} />
      </div>

      <div>
        <label className={labelClass} htmlFor="fullName">
          {t.fullName}
        </label>
        <input id="fullName" name="fullName" required defaultValue={fullName} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">
          {t.phone}
        </label>
        <input id="phone" name="phone" type="tel" defaultValue={phone} className={inputClass} />
      </div>

      {state && !state.success && <p className="text-sm text-red-600">{dict.dashboardPage.errors.generic}</p>}
      {state && state.success && <p className="text-sm text-brand-green">{t.successBody}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
