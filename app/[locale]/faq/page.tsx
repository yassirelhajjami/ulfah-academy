import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.faqPage.title} intro={dict.faqPage.intro} />
      <Container className="py-16">
        <Reveal className="mx-auto max-w-2xl">
          <FaqAccordion items={dict.faqPage.items} />
        </Reveal>
      </Container>
    </>
  );
}
