"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { AddChildForm } from "./add-child-form";

export type ChildRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  enrollment_status: string;
};

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

const statusStyles: Record<string, string> = {
  lead: "bg-brand-dark/10 text-brand-dark/70",
  pending_assessment: "bg-brand-gold/20 text-brand-dark",
  active: "bg-brand-green/15 text-brand-green",
  paused: "bg-orange-100 text-orange-700",
  inactive: "bg-red-100 text-red-700",
};

export function ChildrenPageClient({
  dict,
  locale,
  childrenList,
}: {
  dict: Dictionary;
  locale: Locale;
  childrenList: ChildRow[];
}) {
  const [showForm, setShowForm] = useState(childrenList.length === 0);
  const t = dict.dashboardPage.children;
  const statusLabels = t.statusLabels as Record<string, string>;

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
        <AddChildForm dict={dict} locale={locale} onCancel={() => setShowForm(false)} />
      )}

      {childrenList.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-brand-dark/10 bg-white p-10 text-center">
          <h2 className="font-bold text-brand-dark">{t.emptyTitle}</h2>
          <p className="mt-2 text-sm text-brand-dark/60">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {childrenList.map((child) => (
            <Link
              key={child.id}
              href={localizedHref(locale, `/dashboard/children/${child.id}`)}
              className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-brand-dark">{child.full_name}</h3>
                  <p className="mt-1 text-xs text-brand-dark/50">
                    {calculateAge(child.date_of_birth)} {t.ageSuffix}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[child.enrollment_status] ?? statusStyles.lead
                  }`}
                >
                  {statusLabels[child.enrollment_status] ?? child.enrollment_status}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-brand-green">{t.viewDetails} ←</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
