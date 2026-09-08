"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { submitAssessmentRequest } from "@/lib/actions/book-assessment";
import type { ActionResult } from "@/lib/actions/contact";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function BookAssessmentForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => submitAssessmentRequest(formData),
    initialState
  );

  const f = dict.bookAssessment.form;

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-8 text-center">
        <h2 className="text-xl font-bold text-brand-green">{f.successTitle}</h2>
        <p className="mt-3 text-brand-dark/70">{f.successBody}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className={labelClass} htmlFor="parentName">
          {f.parentName}
        </label>
        <input id="parentName" name="parentName" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="parentEmail">
          {f.parentEmail}
        </label>
        <input id="parentEmail" name="parentEmail" type="email" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="parentPhone">
          {f.parentPhone}
        </label>
        <input id="parentPhone" name="parentPhone" type="tel" className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="childName">
          {f.childName}
        </label>
        <input id="childName" name="childName" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="childAge">
          {f.childAge}
        </label>
        <input id="childAge" name="childAge" type="number" min={2} max={20} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="preferredProgram">
          {f.preferredProgram}
        </label>
        <select id="preferredProgram" name="preferredProgram" className={inputClass} defaultValue="">
          <option value="" disabled>
            —
          </option>
          {dict.programsPage.items.map((program) => (
            <option key={program.slug} value={program.slug}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="readingAbility">
          {f.readingAbility}
        </label>
        <input id="readingAbility" name="readingAbility" className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="preferredContactTime">
          {f.preferredContactTime}
        </label>
        <input id="preferredContactTime" name="preferredContactTime" className={inputClass} />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="memorizedSurahs">
          {f.memorizedSurahs}
        </label>
        <input id="memorizedSurahs" name="memorizedSurahs" className={inputClass} />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="message">
          {f.message}
        </label>
        <textarea id="message" name="message" rows={4} className={inputClass} />
      </div>

      {state && !state.success && <p className="text-sm text-red-600 sm:col-span-2">{f.errorBody}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-dark transition-colors hover:brightness-95 disabled:opacity-60 sm:w-auto"
        >
          {pending ? f.submitting : f.submit}
        </button>
      </div>
    </form>
  );
}
