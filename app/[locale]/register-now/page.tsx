import { resolveLocale } from "@/lib/i18n/resolve";
import { localizedHref } from "@/lib/i18n/path";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";

export default async function RegisterNowPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.registerNowPage;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? localizedHref(locale, "/dashboard/children") : localizedHref(locale, "/auth/register");
  const ctaLabel = user ? t.ctaLoggedIn : t.ctaLoggedOut;

  return (
    <>
      <PageHero title={t.title} intro={t.intro} />

      <Container className="py-16">
        <div className="mx-auto max-w-2xl space-y-6">
          <Reveal className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-brand-green">{t.step1Title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-dark/70">{t.step1Body}</p>
            </div>
            <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-brand-green">{t.step2Title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-dark/70">{t.step2Body}</p>
            </div>
          </Reveal>

          <Reveal delay={150} className="rounded-2xl bg-brand-green/5 p-8 text-center">
            <ButtonLink href={ctaHref} variant="primary">
              {ctaLabel}
            </ButtonLink>

            {!user && (
              <p className="mt-4 text-sm text-brand-dark/60">
                {t.alreadyHaveAccount}{" "}
                <a href={localizedHref(locale, "/auth/login")} className="font-semibold text-brand-green hover:underline">
                  {t.loginLink}
                </a>
              </p>
            )}

            <p className="mt-2 text-sm text-brand-dark/60">
              {t.orBookAssessment}{" "}
              <a href={localizedHref(locale, "/book-assessment")} className="font-semibold text-brand-green hover:underline">
                {t.bookAssessmentLink}
              </a>
            </p>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
