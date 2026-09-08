import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";

export function ProgramsGrid({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="programs" className="bg-white py-20">
      <Container>
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl font-bold text-brand-green sm:text-3xl">{dict.home.programs.title}</h2>
          <p className="max-w-2xl text-brand-dark/70">{dict.home.programs.subtitle}</p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.programs.items.map((program, index) => (
            <Reveal key={program.slug} delay={index * 100}>
              <div className="flex h-full flex-col rounded-2xl border border-brand-dark/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold hover:shadow-lg">
                <span className="w-fit rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
                  {program.ageRange}
                </span>
                <h3 className="mt-4 font-semibold text-brand-dark">{program.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-brand-dark/70">{program.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <ButtonLink href={localizedHref(locale, "/programs")} variant="outline">
            {dict.home.programs.viewAll}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
