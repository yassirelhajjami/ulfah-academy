"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type ActionResult = { success: true } | { success: false; error: string };

function getLocale(formData: FormData) {
  const raw = String(formData.get("locale") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

export async function addChildAction(formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const locale = getLocale(formData);

  if (!fullName || !dateOfBirth) return { success: false, error: "missing_fields" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "generic" };

  // Generate the id client-side rather than reading it back via `.select()`:
  // a freshly-inserted "lead" student has no parent_children row yet, so it
  // doesn't pass students_select_involved yet either — INSERT ... RETURNING
  // requires the new row to satisfy the table's SELECT policy too, which
  // makes Postgres report the whole insert as an RLS violation. Passing a
  // known id sidesteps needing RETURNING at all.
  const studentId = crypto.randomUUID();

  const { error: studentError } = await supabase.from("students").insert({
    id: studentId,
    full_name: fullName,
    date_of_birth: dateOfBirth,
    gender: gender === "male" || gender === "female" ? gender : null,
  });

  if (studentError) {
    return { success: false, error: "generic" };
  }

  const { error: linkError } = await supabase.from("parent_children").insert({
    parent_id: user.id,
    student_id: studentId,
  });

  if (linkError) {
    // Best-effort compensation — a parent can't delete a students row under
    // the current RLS policy (delete is admin-only), so this is a no-op in
    // practice; an orphaned "lead" row here needs manual/admin cleanup.
    await supabase.from("students").delete().eq("id", studentId);
    return { success: false, error: "generic" };
  }

  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/dashboard/children`);
  redirect(`/${locale}/dashboard/children`);
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const locale = getLocale(formData);

  if (!fullName) return { success: false, error: "missing_fields" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "generic" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/dashboard/account`);
  return { success: true };
}
