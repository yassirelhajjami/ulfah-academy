import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";

export function CtaBanner({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="bg-brand-dark py-16 text-white">
      <Container>
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.cta.title}</h2>
          <p className="max-w-xl text-white/75">{dict.home.cta.subtitle}</p>
          <ButtonLink href={localizedHref(locale, "/book-assessment")} variant="gold" className="mt-2">
            {dict.home.cta.button}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
