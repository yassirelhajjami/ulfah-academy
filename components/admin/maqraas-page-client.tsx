"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { deleteMaqraaAction } from "@/lib/actions/admin";
import { AddMaqraaForm } from "./add-maqraa-form";
import { DeleteItemButton } from "./delete-item-button";

export type MaqraaRow = { id: string; name: string; description: string | null; group_count: number };

export function MaqraasPageClient({
  dict,
  locale,
  maqraas,
}: {
  dict: Dictionary;
  locale: Locale;
  maqraas: MaqraaRow[];
}) {
  const [showForm, setShowForm] = useState(maqraas.length === 0);
  const t = dict.adminPage.maqraas;

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

      {showForm && <AddMaqraaForm dict={dict} locale={locale} onCancel={() => setShowForm(false)} />}

      {maqraas.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-brand-dark/10 bg-white p-10 text-center">
          <h2 className="font-bold text-brand-dark">{t.emptyTitle}</h2>
          <p className="mt-2 text-sm text-brand-dark/60">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-dark/10 bg-white shadow-sm">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-brand-dark/10 bg-brand-dark/5 text-start">
              <tr>
                <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colName}</th>
                <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colGroups}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/10">
              {maqraas.map((maqraa) => (
                <tr key={maqraa.id}>
                  <td className="px-4 py-3 font-medium text-brand-dark">{maqraa.name}</td>
                  <td className="px-4 py-3 text-brand-dark/70">{maqraa.group_count}</td>
                  <td className="px-4 py-3 text-end">
                    <DeleteItemButton
                      action={deleteMaqraaAction}
                      hiddenFields={{ maqraaId: maqraa.id, locale }}
                      label={t.deleteButton}
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
