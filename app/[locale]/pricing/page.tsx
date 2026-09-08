import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";
import { localizedHref } from "@/lib/i18n/path";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.pricingPage.title} intro={dict.pricingPage.intro} />

      <Container className="py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {dict.pricingPage.plans.map((plan, index) => (
            <Reveal
              key={plan.name}
              delay={index * 100}
              className={`flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                index === 1
                  ? "border-brand-gold bg-brand-green text-white shadow-lg sm:scale-105 hover:shadow-xl"
                  : "border-brand-dark/10 bg-white hover:shadow-lg"
              }`}
            >
              <h2 className={`text-lg font-bold ${index === 1 ? "text-brand-gold" : "text-brand-green"}`}>
                {plan.name}
              </h2>
              <p className={`mt-1 text-sm font-medium ${index === 1 ? "text-white/80" : "text-brand-dark/60"}`}>
                {plan.sessionsPerWeek}
              </p>
              <p className={`mt-4 text-sm leading-6 ${index === 1 ? "text-white/85" : "text-brand-dark/70"}`}>
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-center gap-2 text-sm ${
                      index === 1 ? "text-white/90" : "text-brand-dark/75"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        index === 1 ? "bg-brand-gold" : "bg-brand-green"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={localizedHref(locale, "/book-assessment")}
                variant={index === 1 ? "gold" : "outline"}
                className="mt-8"
              >
                {dict.nav.bookAssessment}
              </ButtonLink>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-brand-dark/60">{dict.pricingPage.note}</p>
      </Container>
    </>
  );
}
