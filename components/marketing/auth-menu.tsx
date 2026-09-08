import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { localizedHref } from "@/lib/i18n/path";
import { signOutAction } from "@/lib/actions/auth";

export function AuthMenu({
  dict,
  locale,
  user,
  className = "",
}: {
  dict: Dictionary;
  locale: Locale;
  user: { fullName: string | null } | null;
  className?: string;
}) {
  if (!user) {
    return (
      <Link
        href={localizedHref(locale, "/auth/login")}
        className={`text-sm font-medium text-brand-dark/80 transition-colors hover:text-brand-green ${className}`}
      >
        {dict.nav.login}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link
        href={localizedHref(locale, "/dashboard")}
        className="text-sm font-medium text-brand-dark/80 transition-colors hover:text-brand-green"
      >
        {user.fullName ?? dict.nav.dashboard}
      </Link>
      <form action={signOutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="text-sm font-medium text-brand-dark/50 transition-colors hover:text-red-600"
        >
          {dict.nav.logout}
        </button>
      </form>
    </div>
  );
}
