import { resolveLocale } from "@/lib/i18n/resolve";
import { createClient } from "@/lib/supabase/server";
import { ChildrenPageClient, type ChildRow } from "@/components/dashboard/children-page-client";

export default async function ChildrenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: links } = await supabase
    .from("parent_children")
    .select("students(id, full_name, date_of_birth, enrollment_status)")
    .eq("parent_id", user?.id ?? "");

  // Supabase infers embedded resources as arrays without generated DB types;
  // parent_children.student_id is a to-one FK, so this is actually a single
  // object per row (verified against the live schema).
  const rows = (links ?? []) as unknown as { students: ChildRow | null }[];
  const children = rows.flatMap((l) => (l.students ? [l.students] : []));

  return <ChildrenPageClient dict={dict} locale={locale} childrenList={children} />;
}
