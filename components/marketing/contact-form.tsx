"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { submitContactMessage, type ActionResult } from "@/lib/actions/contact";

const initialState: ActionResult | null = null;

export function ContactForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => submitContactMessage(formData),
    initialState
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-6 text-brand-green">
        {dict.contactPage.form.success}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark/80" htmlFor="name">
          {dict.contactPage.form.name}
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark/80" htmlFor="email">
          {dict.contactPage.form.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark/80" htmlFor="message">
          {dict.contactPage.form.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
        />
      </div>

      {state && !state.success && (
        <p className="text-sm text-red-600">{dict.bookAssessment.form.errorBody}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
      >
        {pending ? dict.bookAssessment.form.submitting : dict.contactPage.form.submit}
      </button>
    </form>
  );
}
