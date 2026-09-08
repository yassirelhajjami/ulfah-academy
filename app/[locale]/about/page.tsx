import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.about.title} intro={dict.about.intro} />

      <Container className="grid gap-10 py-16 sm:grid-cols-2">
        <Reveal className="rounded-2xl border border-brand-dark/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-xl font-bold text-brand-green">{dict.about.missionTitle}</h2>
          <p className="mt-3 leading-7 text-brand-dark/75">{dict.about.mission}</p>
        </Reveal>
        <Reveal delay={100} className="rounded-2xl border border-brand-dark/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-xl font-bold text-brand-green">{dict.about.visionTitle}</h2>
          <p className="mt-3 leading-7 text-brand-dark/75">{dict.about.vision}</p>
        </Reveal>
      </Container>

      <Container className="pb-16">
        <Reveal className="rounded-2xl bg-brand-green/5 p-8 sm:p-10">
          <h2 className="text-center text-xl font-bold text-brand-green">{dict.about.objectivesTitle}</h2>
          <ul className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
            {dict.about.objectives.map((objective) => (
              <li key={objective} className="flex items-start gap-3 text-sm leading-6 text-brand-dark/75">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                {objective}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <Container className="pb-20">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-brand-green">{dict.about.valuesTitle}</h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.about.values.map((value, index) => (
            <Reveal key={value.title} delay={index * 80}>
              <div className="h-full rounded-2xl border border-brand-dark/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold hover:shadow-lg">
                <h3 className="font-semibold text-brand-dark">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-dark/70">{value.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
