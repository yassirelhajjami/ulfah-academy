"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { signOutAction } from "@/lib/actions/auth";

type NavLink = { href: string; label: string; exact: boolean };

function navItemClass(active: boolean) {
  return `block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
    active ? "bg-brand-dark text-white" : "text-brand-dark/75 hover:bg-brand-dark/5 hover:text-brand-dark"
  }`;
}

function AdminNavLinks({
  links,
  locale,
  pathname,
  onNavigate,
}: {
  links: NavLink[];
  locale: Locale;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map((link) => {
        const target = localizedHref(locale, link.href);
        const active = link.exact ? pathname === target : pathname.startsWith(target);
        return (
          <Link key={link.href} href={target} onClick={onNavigate} className={navItemClass(active)}>
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminShell({
  dict,
  locale,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: NavLink[] = [
    { href: "/admin", label: dict.adminPage.nav.overview, exact: true },
    { href: "/admin/teachers", label: dict.adminPage.nav.teachers, exact: false },
    { href: "/admin/groups", label: dict.adminPage.nav.groups, exact: false },
    { href: "/admin/students", label: dict.adminPage.nav.students, exact: false },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside className="hidden w-64 shrink-0 border-e border-brand-dark/10 bg-white p-6 lg:block">
        <Link href={localizedHref(locale, "/")} className="flex items-center gap-2 font-bold text-brand-green">
          <Image src="/brand/mark.png" alt="" width={32} height={33} className="h-8 w-auto" />
          <span>{dict.meta.siteName}</span>
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-gold">Admin</p>

        <nav className="mt-6 space-y-1">
          <AdminNavLinks links={links} locale={locale} pathname={pathname} />
        </nav>

        <div className="mt-8 space-y-1 border-t border-brand-dark/10 pt-4">
          <Link href={localizedHref(locale, "/dashboard")} className={navItemClass(false)}>
            {dict.adminPage.nav.backToSite}
          </Link>
          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="block w-full rounded-xl px-4 py-2.5 text-start text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
              {dict.nav.logout}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-brand-dark/10 bg-white px-4 py-3 lg:hidden">
        <Link href={localizedHref(locale, "/")} className="flex items-center gap-2 font-bold text-brand-green">
          <Image src="/brand/mark.png" alt="" width={28} height={29} className="h-7 w-auto" />
          <span className="text-sm">{dict.meta.siteName} — Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-dark/10"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-brand-dark/10 bg-white p-4 lg:hidden">
          <nav className="space-y-1">
            <AdminNavLinks
              links={links}
              locale={locale}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <Link href={localizedHref(locale, "/dashboard")} className={navItemClass(false)} onClick={() => setMobileOpen(false)}>
              {dict.adminPage.nav.backToSite}
            </Link>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="block w-full rounded-xl px-4 py-2.5 text-start text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                {dict.nav.logout}
              </button>
            </form>
          </nav>
        </div>
      )}

      <main className="flex-1 bg-brand-cream p-4 sm:p-8">{children}</main>
    </div>
  );
}
