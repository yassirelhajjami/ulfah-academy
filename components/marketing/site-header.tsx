"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { LanguageSwitcher } from "./language-switcher";
import { AuthMenu } from "./auth-menu";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export function SiteHeader({
  dict,
  locale,
  user,
}: {
  dict: Dictionary;
  locale: Locale;
  user: { fullName: string | null } | null;
}) {
  const [open, setOpen] = useState(false);

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
    <header className="sticky top-0 z-40 border-b border-brand-dark/10 bg-brand-cream/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link href={localizedHref(locale, "/")} className="flex shrink-0 items-center gap-2 font-bold text-brand-green">
          <Image src="/brand/mark.png" alt="" width={32} height={33} className="h-8 w-auto" priority />
          <span className="hidden text-base sm:inline">{dict.meta.siteName}</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={localizedHref(locale, link.href)}
              className="whitespace-nowrap text-brand-dark/80 transition-colors hover:text-brand-green"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <AuthMenu dict={dict} locale={locale} user={user} />
          <LanguageSwitcher locale={locale} />
          <ButtonLink href={localizedHref(locale, "/book-assessment")} variant="gold" className="whitespace-nowrap px-4 py-2">
            {dict.nav.bookAssessment}
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-dark/10 xl:hidden"
          aria-expanded={open}
          aria-label="Menu"
        >
          <span className="sr-only">Menu</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </Container>

      {open && (
        <div className="border-t border-brand-dark/10 bg-brand-cream xl:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={localizedHref(locale, link.href)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-dark/80 hover:bg-brand-green/5 hover:text-brand-green"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 px-3">
              <AuthMenu dict={dict} locale={locale} user={user} />
              <LanguageSwitcher locale={locale} />
            </div>
            <div className="px-3 pt-2">
              <ButtonLink href={localizedHref(locale, "/book-assessment")} variant="gold" className="w-full">
                {dict.nav.bookAssessment}
              </ButtonLink>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
