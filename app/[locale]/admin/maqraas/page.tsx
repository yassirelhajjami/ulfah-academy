import { resolveLocale } from "@/lib/i18n/resolve";
import { createClient } from "@/lib/supabase/server";
import { MaqraasPageClient, type MaqraaRow } from "@/components/admin/maqraas-page-client";

export default async function AdminMaqraasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const supabase = await createClient();

  const { data } = await supabase.from("maqraas").select("id, name, description, groups(id)").order("name");

  type RawMaqraa = { id: string; name: string; description: string | null; groups: { id: string }[] };
  const rawMaqraas = (data ?? []) as unknown as RawMaqraa[];
  const maqraas: MaqraaRow[] = rawMaqraas.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    group_count: m.groups?.length ?? 0,
  }));

  return <MaqraasPageClient dict={dict} locale={locale} maqraas={maqraas} />;
}
