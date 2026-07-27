import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "zh", "es", "ar"],
  defaultLocale: "zh",
  // Every public locale is encoded in the URL path (/zh, /en, /es, /ar).
  // Keep this explicit so metadata and sitemap URLs cannot drift from the
  // middleware's default prefix behavior during next-intl upgrades.
  localePrefix: "always",
  // Metadata and sitemap generation already emit the complete hreflang map.
  // Disable next-intl's additional HTTP Link header so crawlers do not receive
  // a second, conflicting x-default URL from the middleware.
  alternateLinks: false,
  // Avoid writing NEXT_LOCALE on public pages so they can use shared HTTP/CDN
  // caching.
  localeCookie: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
