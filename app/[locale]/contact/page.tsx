import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/marketing/contact-form";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.contactPage.title} intro={dict.contactPage.intro} />

      <Container className="grid gap-10 py-16 sm:grid-cols-[2fr_1fr]">
        <Reveal>
          <ContactForm dict={dict} locale={locale} />
        </Reveal>

        <Reveal delay={150} className="h-fit rounded-2xl border border-brand-dark/10 bg-white p-6 transition-shadow duration-300 hover:shadow-lg">
          <h2 className="font-semibold text-brand-green">{dict.contactPage.infoTitle}</h2>
          <p className="mt-3 text-sm text-brand-dark/70" dir="ltr">
            {dict.contactPage.email}
          </p>
        </Reveal>
      </Container>
    </>
  );
}
