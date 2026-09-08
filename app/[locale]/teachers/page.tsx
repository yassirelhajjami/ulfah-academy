import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export default async function TeachersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.teachersPage.title} intro={dict.teachersPage.intro} />

      <Container className="py-16">
        <Reveal className="mx-auto max-w-2xl rounded-2xl border border-brand-dark/10 bg-white p-8 transition-shadow duration-300 hover:shadow-lg">
          <h2 className="text-xl font-bold text-brand-green">{dict.teachersPage.criteriaTitle}</h2>
          <ul className="mt-4 space-y-3">
            {dict.teachersPage.criteria.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-brand-dark/75">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-brand-dark/60">
          {dict.teachersPage.comingSoonNote}
        </p>
      </Container>
    </>
  );
}
