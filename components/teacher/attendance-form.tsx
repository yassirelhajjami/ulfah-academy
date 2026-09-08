"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { markAttendanceAction, type ActionResult } from "@/lib/actions/teacher";

const initialState: ActionResult | null = null;

export function AttendanceForm({
  dict,
  groupId,
  sessionId,
  students,
  existing,
}: {
  dict: Dictionary;
  groupId: string;
  sessionId: string;
  students: { id: string; full_name: string }[];
  existing: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => markAttendanceAction(formData),
    initialState
  );
  const t = dict.teacherPage.groupDetail;
  const statuses = t.attendanceStatuses;

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="groupId" value={groupId} />
      <h3 className="font-bold text-brand-green">{t.attendanceTitle}</h3>

      <div className="space-y-2">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 p-3">
            <input type="hidden" name="studentId" value={student.id} />
            <span className="text-sm font-medium text-brand-dark">{student.full_name}</span>
            <select
              name={`status_${student.id}`}
              defaultValue={existing[student.id] ?? "present"}
              className="rounded-lg border border-brand-dark/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-green"
            >
              <option value="present">{statuses.present}</option>
              <option value="absent">{statuses.absent}</option>
              <option value="late">{statuses.late}</option>
              <option value="excused">{statuses.excused}</option>
            </select>
          </div>
        ))}
      </div>

      {state && !state.success && <p className="text-sm text-red-600">{dict.teacherPage.errors.generic}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t.savingAttendance : t.saveAttendance}
      </button>
    </form>
  );
}
