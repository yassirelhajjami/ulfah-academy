import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function adminErrorMessage(dict: Dictionary, code: string): string {
  const errors = dict.adminPage.errors;
  switch (code) {
    case "parent_not_found":
      return errors.parentNotFound;
    case "email_in_use":
      return errors.emailInUse;
    default:
      return errors.generic;
  }
}
