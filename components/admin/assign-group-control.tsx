"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { assignStudentGroupAction, type ActionResult } from "@/lib/actions/admin";

const initialState: ActionResult | null = null;

export function AssignGroupControl({
  dict,
  studentId,
  currentGroupId,
  groups,
}: {
  dict: Dictionary;
  studentId: string;
  currentGroupId: string | null;
  groups: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => assignStudentGroupAction(formData),
    initialState
  );
  const t = dict.adminPage.students.assignForm;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="studentId" value={studentId} />
      <select
        name="groupId"
        defaultValue={currentGroupId ?? ""}
        className="rounded-lg border border-brand-dark/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-green"
      >
        <option value="">{t.noneOption}</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-green px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
      >
        {pending ? t.submitting : t.submit}
      </button>
      {state && !state.success && <span className="text-xs text-red-600">!</span>}
    </form>
  );
}
