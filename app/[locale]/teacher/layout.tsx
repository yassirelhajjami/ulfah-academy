import { redirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { TeacherShell } from "@/components/teacher/teacher-shell";

export default async function TeacherLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(localizedHref(locale, "/auth/login"));
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();

  if (!profile || profile.role !== "teacher") {
    redirect(localizedHref(locale, "/dashboard"));
  }

  return (
    <TeacherShell dict={dict} locale={locale} fullName={profile.full_name}>
      {children}
    </TeacherShell>
  );
}
