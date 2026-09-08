import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import { Hero } from "@/components/marketing/hero";
import { WhyUs } from "@/components/marketing/why-us";
import { ProgramsGrid } from "@/components/marketing/programs-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { SectionQuickNav } from "@/components/marketing/section-quick-nav";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const quickNavItems = [
    { id: "why-us", label: dict.home.why.title },
    { id: "programs", label: dict.home.programs.title },
    { id: "how-it-works", label: dict.home.how.title },
  ];

  return (
    <>
      <Hero dict={dict} locale={locale} />
      <SectionQuickNav items={quickNavItems} />
      <WhyUs dict={dict} />
      <ProgramsGrid dict={dict} locale={locale} />
      <HowItWorks dict={dict} />
      <CtaBanner dict={dict} locale={locale} />
    </>
  );
}
