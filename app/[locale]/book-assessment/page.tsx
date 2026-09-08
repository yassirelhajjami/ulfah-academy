import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { BookAssessmentForm } from "@/components/marketing/book-assessment-form";

export default async function BookAssessmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.bookAssessment.title} intro={dict.bookAssessment.intro} />

      <Container className="py-16">
        <ol className="mx-auto mb-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:justify-center sm:gap-6">
          {dict.bookAssessment.steps.map((step, index) => (
            <li key={step}>
              <Reveal delay={index * 100} className="flex items-center gap-2 text-sm font-medium text-brand-dark/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={200} className="mx-auto max-w-3xl rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-10">
          <BookAssessmentForm dict={dict} locale={locale} />
        </Reveal>
      </Container>
    </>
  );
}
