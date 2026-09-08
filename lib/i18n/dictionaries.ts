import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionary-type";
import ar from "./dictionaries/ar";
import en from "./dictionaries/en";
import nl from "./dictionaries/nl";

const dictionaries: Record<Locale, Dictionary> = { ar, en, nl };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.ar;
}
