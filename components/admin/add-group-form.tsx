"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { createGroupAction, type ActionResult } from "@/lib/actions/admin";

const initialState: ActionResult | null = null;

const inputClass =
  "w-full rounded-xl border border-brand-dark/15 bg-white px-4 py-2.5 outline-none transition-all duration-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";
const labelClass = "mb-1 block text-sm font-medium text-brand-dark/80";

export function AddGroupForm({
  dict,
  locale,
  programs,
  levels,
  teachers,
  onCancel,
}: {
  dict: Dictionary;
  locale: Locale;
  programs: { id: string; name_ar: string; name_en: string }[];
  levels: { id: string; program_id: string; name_ar: string; name_en: string }[];
  teachers: { id: string; full_name: string }[];
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => createGroupAction(formData),
    initialState
  );
  const t = dict.adminPage.groups.form;
  const nameKey = locale === "ar" ? "name_ar" : "name_en";

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <h2 className="font-bold text-brand-green">{t.title}</h2>

      <div>
        <label className={labelClass} htmlFor="name">
          {t.name}
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="programId">
            {t.program}
          </label>
          <select id="programId" name="programId" defaultValue="" className={inputClass}>
            <option value="">{t.noneOption}</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p[nameKey]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="levelId">
            {t.level}
          </label>
          <select id="levelId" name="levelId" defaultValue="" className={inputClass}>
            <option value="">{t.noneOption}</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l[nameKey]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="teacherId">
            {t.teacher}
          </label>
          <select id="teacherId" name="teacherId" defaultValue="" className={inputClass}>
            <option value="">{t.noneOption}</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="capacity">
            {t.capacity}
          </label>
          <input id="capacity" name="capacity" type="number" min={1} defaultValue={8} className={inputClass} />
        </div>
      </div>

      {state && !state.success && <p className="text-sm text-red-600">{dict.adminPage.errors.generic}</p>}

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
