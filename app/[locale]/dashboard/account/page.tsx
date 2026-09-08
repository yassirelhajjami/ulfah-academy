import { resolveLocale } from "@/lib/i18n/resolve";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/dashboard/account-form";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.dashboardPage.account;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user?.id ?? "")
    .single();

  const roles = dict.auth.dashboard.roles as Record<string, string>;
  const roleLabel = profile?.role ? roles[profile.role] ?? profile.role : "";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-green">{t.title}</h1>
        <p className="mt-1 text-sm text-brand-dark/70">{t.intro}</p>
      </div>

      <AccountForm
        dict={dict}
        locale={locale}
        email={user?.email ?? ""}
        fullName={profile?.full_name ?? ""}
        phone={profile?.phone ?? ""}
        roleLabel={roleLabel}
      />
    </div>
  );
}
