import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function WhyUs({ dict }: { dict: Dictionary }) {
  return (
    <section id="why-us" className="py-20">
      <Container>
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Image
            src="/brand/mark.png"
            alt={dict.meta.siteName}
            width={72}
            height={74}
            className="mb-5 h-16 w-auto"
          />
          <h2 className="text-2xl font-bold text-brand-green sm:text-3xl">{dict.home.why.title}</h2>
          <p className="mt-3 text-brand-dark/70">{dict.home.why.subtitle}</p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          <Reveal delay={100} className="group relative h-56 overflow-hidden rounded-2xl shadow-sm sm:h-64">
            <Image
              src="/images/child-reading-quran.jpg"
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Reveal>
          <Reveal delay={200} className="group relative h-56 overflow-hidden rounded-2xl shadow-sm sm:h-64">
            <Image
              src="/images/boys-quran-group.jpg"
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dict.home.why.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <div className="h-full rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <h3 className="font-semibold text-brand-green">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-dark/70">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
