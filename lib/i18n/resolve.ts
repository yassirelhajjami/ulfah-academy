import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

export async function resolveLocale(paramsPromise: Promise<{ locale: string }>) {
  const { locale: raw } = await paramsPromise;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  return { locale, dict: getDictionary(locale) };
}
