import { resolveLocale } from "@/lib/i18n/resolve";
import { createClient } from "@/lib/supabase/server";
import { StudentsPageClient } from "@/components/admin/students-page-client";

export default async function AdminStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const supabase = await createClient();

  const [studentsResult, groupsResult] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, date_of_birth, enrollment_status, group_id")
      .order("created_at", { ascending: false }),
    supabase.from("groups").select("id, name"),
  ]);

  return (
    <StudentsPageClient
      dict={dict}
      locale={locale}
      students={studentsResult.data ?? []}
      groups={groupsResult.data ?? []}
    />
  );
}
