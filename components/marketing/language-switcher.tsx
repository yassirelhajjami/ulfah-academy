"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

const otherLocale: Record<Locale, Locale> = { ar: "en", en: "ar" };
const shortLabel: Record<Locale, string> = { ar: "AR", en: "EN" };

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.split("/").slice(2).join("/");
  const target = otherLocale[locale];
  const href = `/${target}${rest ? `/${rest}` : ""}`;

  return (
    <Link
      href={href}
      className="flex h-8 w-10 items-center justify-center rounded-full border border-brand-dark/15 text-xs font-semibold text-brand-dark/70 transition-colors hover:border-brand-green hover:text-brand-green"
    >
      {shortLabel[target]}
    </Link>
  );
}
