"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { resetPasswordAction, type AuthResult } from "@/lib/actions/auth";
import { authErrorMessage } from "./error-message";

const initialState: AuthResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function ResetPasswordForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    async (_prev, formData) => resetPasswordAction(formData),
    initialState
  );
  const t = dict.auth.resetPassword;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className={labelClass} htmlFor="password">
          {t.password}
        </label>
        <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="confirmPassword">
          {t.confirmPassword}
        </label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className={inputClass} />
      </div>

      {state && !state.success && <p className="text-sm text-red-600">{authErrorMessage(dict, state.error)}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
