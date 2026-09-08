"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type ActionResult = { success: true } | { success: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactMessage(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  if (!name || !email || !message) {
    return { success: false, error: "missing_fields" };
  }
  if (!EMAIL_RE.test(email)) {
    return { success: false, error: "invalid_email" };
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      message,
      locale,
    });
    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "server_error" };
  }
}
