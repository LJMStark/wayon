import type { AppLocale } from "@/i18n/types";

export function normalizeMetadataPath(locale: AppLocale, path: string): string {
  if (path === "/") {
    return `/${locale}`;
  }

  return `/${locale}${path}`;
}
