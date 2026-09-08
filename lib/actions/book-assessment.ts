"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import type { ActionResult } from "./contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitAssessmentRequest(formData: FormData): Promise<ActionResult> {
  const parentName = String(formData.get("parentName") ?? "").trim();
  const parentEmail = String(formData.get("parentEmail") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();
  const childName = String(formData.get("childName") ?? "").trim();
  const childAgeRaw = String(formData.get("childAge") ?? "").trim();
  const preferredProgramSlug = String(formData.get("preferredProgram") ?? "").trim();
  const readingAbility = String(formData.get("readingAbility") ?? "").trim();
  const memorizedSurahs = String(formData.get("memorizedSurahs") ?? "").trim();
  const preferredContactTime = String(formData.get("preferredContactTime") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const childAge = Number(childAgeRaw);

  if (!parentName || !parentEmail || !childName || !childAgeRaw) {
    return { success: false, error: "missing_fields" };
  }
  if (!EMAIL_RE.test(parentEmail)) {
    return { success: false, error: "invalid_email" };
  }
  if (!Number.isFinite(childAge) || childAge < 2 || childAge > 20) {
    return { success: false, error: "invalid_age" };
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("assessment_requests").insert({
      parent_name: parentName,
      parent_email: parentEmail,
      parent_phone: parentPhone || null,
      child_name: childName,
      child_age: childAge,
      preferred_program_slug: preferredProgramSlug || null,
      reading_ability: readingAbility || null,
      memorized_surahs: memorizedSurahs || null,
      preferred_contact_time: preferredContactTime || null,
      message: message || null,
      locale,
    });
    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "server_error" };
  }
}
