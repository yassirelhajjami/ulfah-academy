"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type AuthResult = { success: true } | { success: false; error: string };

function getLocale(formData: FormData) {
  const raw = String(formData.get("locale") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = getLocale(formData);

  if (!fullName || !email || !password) return { success: false, error: "missing_fields" };
  if (password !== confirmPassword) return { success: false, error: "password_mismatch" };
  if (password.length < 8) return { success: false, error: "weak_password" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, locale, ...(phone ? { phone } : {}) },
      emailRedirectTo: `${siteOrigin()}/auth/callback?next=/${locale}/dashboard`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { success: false, error: "email_in_use" };
    }
    return { success: false, error: "generic" };
  }

  return { success: true };
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = getLocale(formData);

  if (!email || !password) return { success: false, error: "missing_fields" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { success: false, error: "invalid_credentials" };

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function signOutAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}

export async function forgotPasswordAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const locale = getLocale(formData);

  if (!email) return { success: false, error: "missing_fields" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/callback?next=/${locale}/auth/reset-password`,
  });

  // Always report success regardless of whether the email exists, so this
  // endpoint can't be used to enumerate registered accounts.
  void error;
  return { success: true };
}

export async function resetPasswordAction(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = getLocale(formData);

  if (password !== confirmPassword) return { success: false, error: "password_mismatch" };
  if (password.length < 8) return { success: false, error: "weak_password" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, error: "generic" };

  redirect(`/${locale}/auth/login?reset=success`);
}
