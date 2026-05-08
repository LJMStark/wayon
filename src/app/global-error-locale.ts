const GLOBAL_ERROR_LOCALES = ["en", "zh", "es", "ar"] as const;

export type GlobalErrorLocale = (typeof GLOBAL_ERROR_LOCALES)[number];

function isGlobalErrorLocale(value: string): value is GlobalErrorLocale {
  return GLOBAL_ERROR_LOCALES.includes(value as GlobalErrorLocale);
}

export function resolveGlobalErrorLocale(cookie: string): GlobalErrorLocale {
  const match = cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1];

  return value && isGlobalErrorLocale(value) ? value : "en";
}
