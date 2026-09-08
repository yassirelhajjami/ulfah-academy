import { resolveLocale } from "@/lib/i18n/resolve";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { TeachersPageClient, type TeacherRow } from "@/components/admin/teachers-page-client";

export default async function AdminTeachersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const supabase = await createClient();

  const { data: teacherProfiles } = await supabase.from("teachers").select("id, profiles(full_name)");

  const rows = (teacherProfiles ?? []) as unknown as { id: string; profiles: { full_name: string } | null }[];

  let teachers: TeacherRow[] = [];
  if (rows.length > 0) {
    const serviceRole = createServiceRoleClient();
    const { data: usersPage } = await serviceRole.auth.admin.listUsers();
    const emailById = new Map(usersPage.users.map((u) => [u.id, u.email ?? ""]));
    teachers = rows.map((r) => ({
      id: r.id,
      full_name: r.profiles?.full_name ?? "",
      email: emailById.get(r.id) ?? "",
    }));
  }

  return <TeachersPageClient dict={dict} locale={locale} teachers={teachers} />;
}
