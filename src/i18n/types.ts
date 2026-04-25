import enMessages from "@/messages/en.json";
import { routing } from "./routing";

export type AppLocale = (typeof routing.locales)[number];
export type AppMessages = typeof enMessages;

const LOCALE_DIRECTIONS: Record<AppLocale, "ltr" | "rtl"> = {
  en: "ltr",
  zh: "ltr",
  es: "ltr",
  ar: "rtl",
};

export function hasLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as AppLocale);
}

export function getLocaleDirection(locale: AppLocale): "ltr" | "rtl" {
  return LOCALE_DIRECTIONS[locale];
}

declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: AppMessages;
  }
}
