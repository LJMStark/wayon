import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "zh", "es", "ar"],
  defaultLocale: "zh",
  // Locale is encoded in the URL path (/zh, /en, /es, /ar). Avoid writing
  // NEXT_LOCALE on public pages so they can use shared HTTP/CDN caching.
  localeCookie: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
