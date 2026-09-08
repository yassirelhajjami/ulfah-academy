"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { AddStudentForm } from "./add-student-form";
import { AssignGroupControl } from "./assign-group-control";
import { DeleteItemButton } from "./delete-item-button";
import { deleteStudentAction } from "@/lib/actions/admin";

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export type StudentRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  enrollment_status: string;
  group_id: string | null;
};

export function StudentsPageClient({
  dict,
  locale,
  students,
  groups,
}: {
  dict: Dictionary;
  locale: Locale;
  students: StudentRow[];
  groups: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const t = dict.adminPage.students;
  const statusLabels = dict.dashboardPage.children.statusLabels as Record<string, string>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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

      {showForm && <AddStudentForm dict={dict} locale={locale} onCancel={() => setShowForm(false)} />}

      {students.length === 0 ? (
        <div className="rounded-2xl border border-brand-dark/10 bg-white p-10 text-center">
          <h2 className="font-bold text-brand-dark">{t.emptyTitle}</h2>
          <p className="mt-2 text-sm text-brand-dark/60">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-dark/10 bg-white shadow-sm">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-brand-dark/10 bg-brand-dark/5">
              <tr>
                <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colName}</th>
                <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colAge}</th>
                <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colStatus}</th>
                <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colGroup}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/10">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-brand-dark">{s.full_name}</td>
                  <td className="px-4 py-3 text-brand-dark/70">{calculateAge(s.date_of_birth)}</td>
                  <td className="px-4 py-3 text-brand-dark/70">
                    {statusLabels[s.enrollment_status] ?? s.enrollment_status}
                  </td>
                  <td className="px-4 py-3">
                    <AssignGroupControl dict={dict} studentId={s.id} currentGroupId={s.group_id} groups={groups} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <DeleteItemButton
                      action={deleteStudentAction}
                      hiddenFields={{ studentId: s.id, locale }}
                      label={t.deleteButton}
                      confirmMessage={t.confirmDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
