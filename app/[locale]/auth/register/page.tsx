import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.auth.register.title} intro={dict.auth.register.intro} />
      <Container className="py-16">
        <Reveal className="mx-auto max-w-md rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-10">
          <RegisterForm dict={dict} locale={locale} />
        </Reveal>
      </Container>
    </>
  );
}
