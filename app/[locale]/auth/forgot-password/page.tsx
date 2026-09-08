import { resolveLocale } from "@/lib/i18n/resolve";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <>
      <PageHero title={dict.auth.forgotPassword.title} intro={dict.auth.forgotPassword.intro} />
      <Container className="py-16">
        <Reveal className="mx-auto max-w-md rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm sm:p-10">
          <ForgotPasswordForm dict={dict} locale={locale} />
        </Reveal>
      </Container>
    </>
  );
}
