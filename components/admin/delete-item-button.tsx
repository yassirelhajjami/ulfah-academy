"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/admin";

const initialState: ActionResult | null = null;

export function DeleteItemButton({
  action,
  hiddenFields,
  label,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  hiddenFields: Record<string, string>;
  label: string;
}) {
  const [, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => action(formData),
    initialState
  );

  return (
    <form action={formAction}>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-600/70 transition-colors hover:text-red-600 disabled:opacity-50"
      >
        {label}
      </button>
    </form>
  );
}
