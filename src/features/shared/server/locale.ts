import { notFound } from "next/navigation";

import { hasLocale, type AppLocale } from "@/i18n/types";

type LocaleParams = {
  locale: string;
};

export function requireLocale(locale: string): AppLocale {
  if (!hasLocale(locale)) {
    notFound();
  }

  return locale;
}

export async function getLocaleParams<T extends LocaleParams>(
  params: Promise<T>
): Promise<Omit<T, "locale"> & { locale: AppLocale }> {
  const resolvedParams = await params;

  return {
    ...resolvedParams,
    locale: requireLocale(resolvedParams.locale),
  };
}
