import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";

type SlotRow = {
  id: string;
  weekday: number;
  start_time: string;
  group_id: string;
  groups: {
    name: string;
    programs: { name_ar: string; name_en: string } | null;
    levels: { name_ar: string; name_en: string } | null;
  } | null;
};

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.schedulePage;
  const nameKey = locale === "ar" ? "name_ar" : "name_en";
  const supabase = await createClient();

  const { data } = await supabase
    .from("group_schedule_slots")
    .select("id, weekday, start_time, group_id, groups(name, programs(name_ar, name_en), levels(name_ar, name_en))")
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  const slots = (data ?? []) as unknown as SlotRow[];

  return (
    <>
      <PageHero title={t.title} intro={t.intro} />

      <Container className="py-16">
        {slots.length === 0 ? (
          <Reveal className="rounded-2xl bg-brand-green/5 p-10 text-center">
            <h2 className="text-lg font-bold text-brand-green">{t.emptyTitle}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-brand-dark/70">{t.emptyBody}</p>
            <div className="mt-6">
              <ButtonLink href={localizedHref(locale, "/book-assessment")} variant="primary">
                {t.cta}
              </ButtonLink>
            </div>
          </Reveal>
        ) : (
          <Reveal className="overflow-x-auto rounded-2xl border border-brand-dark/10 bg-white shadow-sm">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-brand-dark/10 bg-brand-dark/5">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colProgram}</th>
                  <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colLevel}</th>
                  <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colDay}</th>
                  <th className="px-4 py-3 text-start font-semibold text-brand-dark/70">{t.colTime}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="px-4 py-3 font-medium text-brand-dark">
                      {slot.groups?.programs?.[nameKey] ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-brand-dark/70">{slot.groups?.levels?.[nameKey] ?? "—"}</td>
                    <td className="px-4 py-3 text-brand-dark/70">{t.weekdays[slot.weekday]}</td>
                    <td className="px-4 py-3 text-brand-dark/70" dir="ltr">
                      {slot.start_time.slice(0, 5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        )}
      </Container>
    </>
  );
}
