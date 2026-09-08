import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <section id="how-it-works" className="py-20">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-brand-green sm:text-3xl">{dict.home.how.title}</h2>
          <p className="mt-3 text-brand-dark/70">{dict.home.how.subtitle}</p>
        </Reveal>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.how.steps.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 100} className="group relative h-full rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-dark transition-transform duration-300 group-hover:scale-110">
                  <CountUp to={index + 1} />
                </span>
                <h3 className="mt-4 font-semibold text-brand-dark">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-dark/70">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
