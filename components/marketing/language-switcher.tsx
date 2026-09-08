"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

const labels: Record<Locale, string> = { ar: "العربية", en: "English", nl: "Nederlands" };
const shortLabel: Record<Locale, string> = { ar: "AR", en: "EN", nl: "NL" };

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.split("/").slice(2).join("/");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-8 min-w-10 items-center justify-center rounded-full border border-brand-dark/15 px-2 text-xs font-semibold text-brand-dark/70 transition-colors hover:border-brand-green hover:text-brand-green"
      >
        {shortLabel[locale]}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-xl border border-brand-dark/10 bg-white py-1 shadow-lg">
          {locales.map((l) => {
            const href = `/${l}${rest ? `/${rest}` : ""}`;
            const active = l === locale;
            return (
              <Link
                key={l}
                href={href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors ${
                  active ? "bg-brand-green/10 font-semibold text-brand-green" : "text-brand-dark/75 hover:bg-brand-dark/5"
                }`}
              >
                {labels[l]}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
