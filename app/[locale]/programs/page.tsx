import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";
import { localizedHref } from "@/lib/i18n/path";

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.programsPage.title} intro={dict.programsPage.intro} />

      <Container className="grid gap-8 py-16 sm:grid-cols-2">
        {dict.programsPage.items.map((program, index) => (
          <Reveal key={program.slug} delay={index * 100}>
            <div className="flex h-full flex-col rounded-2xl border border-brand-dark/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span className="w-fit rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
                {program.ageRange}
              </span>
              <h2 className="mt-4 text-xl font-bold text-brand-dark">{program.name}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-dark/70">{program.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {program.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-medium text-brand-dark/80 transition-colors hover:bg-brand-gold/30"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </Container>

      <Container className="pb-20">
        <Reveal className="rounded-2xl bg-brand-green/5 p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold text-brand-green">{dict.programsPage.levelsTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-brand-dark/75">{dict.programsPage.levelsNote}</p>
          <div className="mt-6">
            <ButtonLink href={localizedHref(locale, "/book-assessment")} variant="primary">
              {dict.nav.bookAssessment}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
