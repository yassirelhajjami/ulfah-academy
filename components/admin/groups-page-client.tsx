"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { AddGroupForm } from "./add-group-form";

export type GroupRow = {
  id: string;
  name: string;
  capacity: number;
  teacher_name: string | null;
  student_count: number;
};

export function GroupsPageClient({
  dict,
  locale,
  groups,
  programs,
  levels,
  teachers,
  maqraas,
}: {
  dict: Dictionary;
  locale: Locale;
  groups: GroupRow[];
  programs: { id: string; name_ar: string; name_en: string }[];
  levels: { id: string; program_id: string; name_ar: string; name_en: string }[];
  teachers: { id: string; full_name: string }[];
  maqraas: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(groups.length === 0);
  const t = dict.adminPage.groups;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">{t.title}</h1>
          <p className="mt-1 text-sm text-brand-dark/70">{t.intro}</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark"
          >
            {t.addButton}
          </button>
        )}
      </div>

      {showForm && (
        <AddGroupForm
          dict={dict}
          locale={locale}
          programs={programs}
          levels={levels}
          teachers={teachers}
          maqraas={maqraas}
          onCancel={() => setShowForm(false)}
        />
      )}

      {groups.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-brand-dark/10 bg-white p-10 text-center">
          <h2 className="font-bold text-brand-dark">{t.emptyTitle}</h2>
          <p className="mt-2 text-sm text-brand-dark/60">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={localizedHref(locale, `/admin/groups/${group.id}`)}
              className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="font-semibold text-brand-dark">{group.name}</h3>
              <p className="mt-1 text-sm text-brand-dark/60">{group.teacher_name ?? t.noTeacher}</p>
              <p className="mt-3 text-xs text-brand-dark/50">
                {group.student_count}/{group.capacity} {t.studentsCount}
              </p>
              <p className="mt-4 text-sm font-medium text-brand-green">{t.viewDetails} ←</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
