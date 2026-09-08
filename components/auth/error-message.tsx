import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function authErrorMessage(dict: Dictionary, code: string): string {
  const errors = dict.auth.errors;
  switch (code) {
    case "missing_fields":
      return errors.missingFields;
    case "password_mismatch":
      return errors.passwordMismatch;
    case "weak_password":
      return errors.weakPassword;
    case "email_in_use":
      return errors.emailInUse;
    case "invalid_credentials":
      return errors.invalidCredentials;
    default:
      return errors.generic;
  }
}
