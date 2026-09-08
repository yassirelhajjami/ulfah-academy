import { Container } from "@/components/ui/container";

export function PageHero({ title, intro }: { title: string; intro?: string }) {
  return (
    <section className="bg-brand-green py-16 text-white">
      <Container className="text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {intro && <p className="mx-auto mt-4 max-w-2xl text-white/85">{intro}</p>}
      </Container>
    </section>
  );
}
