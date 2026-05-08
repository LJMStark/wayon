import type { AppLocale } from "@/i18n/types";

const APP_LOCALES: AppLocale[] = ["en", "zh", "es", "ar"];

function isAppLocale(value: string): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

export function getLocaleFromPathname(pathname: string): AppLocale {
  const pathLocale = pathname.split("/")[1];

  return isAppLocale(pathLocale) ? pathLocale : "en";
}

export function getBrowserLocale(): AppLocale {
  return getLocaleFromPathname(window.location.pathname);
}

export function getServerLocale(): AppLocale {
  return "en";
}
