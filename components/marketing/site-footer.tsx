import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { Container } from "@/components/ui/container";
import { SocialLinks } from "./social-links";

export function SiteFooter({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const year = new Date().getFullYear();

  const links = [
    { href: "/about", label: dict.nav.about },
    { href: "/programs", label: dict.nav.programs },
    { href: "/schedule", label: dict.nav.schedule },
    { href: "/teachers", label: dict.nav.teachers },
    { href: "/pricing", label: dict.nav.pricing },
    { href: "/faq", label: dict.nav.faq },
    { href: "/register-now", label: dict.nav.registerNow },
  ];

  return (
    <footer className="border-t border-brand-dark/10 bg-brand-dark text-brand-cream">
      <Container className="grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/brand/mark.png" alt="" width={40} height={41} className="h-10 w-auto" />
            <p className="text-lg font-bold text-brand-gold">{dict.meta.siteName}</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-brand-cream/70">{dict.footer.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-gold">{dict.footer.quickLinksTitle}</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-cream/70">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={localizedHref(locale, link.href)} className="transition-colors hover:text-brand-cream">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-gold">{dict.footer.contactTitle}</p>
          <p className="mt-3 text-sm text-brand-cream/70">{dict.contactPage.email}</p>

          <div className="mt-6">
            <SocialLinks title={dict.footer.followUs} label={dict.footer.followUs} />
          </div>
        </div>
      </Container>

      <div className="border-t border-brand-cream/10 py-4 text-center text-xs text-brand-cream/50">
        {dict.meta.siteName} © {year} — {dict.footer.rights}
      </div>
    </footer>
  );
}
