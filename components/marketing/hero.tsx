import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";
import { HeroBackgroundLoop } from "./hero-background-loop";

const HERO_IMAGES = [
  "/images/hero-quran-mosque.jpg",
  "/images/hero-mosque-hagia-sophia.jpg",
  "/images/hero-quran-beads.jpg",
  "/images/hero-mosque-ottoman.jpg",
];

export function Hero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="hero" className="relative overflow-hidden bg-brand-green text-white">
      <div className="absolute inset-0 opacity-60">
        <HeroBackgroundLoop images={HERO_IMAGES} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-dark/75 via-brand-green/45 to-brand-dark/85"
      />
      <Container className="relative flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <Reveal>
          <span className="rounded-full bg-brand-dark/50 px-4 py-1.5 text-sm font-medium text-brand-gold shadow-sm backdrop-blur-sm">
            {dict.home.hero.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="max-w-3xl text-balance text-3xl font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-5xl">
            {dict.home.hero.title}
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="max-w-2xl text-balance text-base leading-8 text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)] sm:text-lg">
            {dict.home.hero.subtitle}
          </p>
        </Reveal>
        <Reveal delay={300} className="mt-2 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={localizedHref(locale, "/book-assessment")} variant="gold">
            {dict.home.hero.ctaPrimary}
          </ButtonLink>
          <ButtonLink
            href={localizedHref(locale, "/programs")}
            variant="outline"
            className="border-white/40 text-white hover:bg-white hover:text-brand-green"
          >
            {dict.home.hero.ctaSecondary}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
