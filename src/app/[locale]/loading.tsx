"use client";

import { useLocale } from "next-intl";

import { getCommonCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

// Client component on purpose: loading.tsx is the Suspense fallback for the
// whole [locale] segment and receives no `params`, so it cannot use
// setRequestLocale. The server `getLocale()` reads request headers, which opts
// the entire segment into dynamic rendering. useLocale() reads the locale from
// NextIntlClientProvider (set with an explicit, static locale in the layout),
// keeping every route statically renderable.
export default function LocaleLoading() {
  const locale = useLocale() as AppLocale;
  const copy = getCommonCopy(locale);

  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-6 py-24 text-center text-[#1a1a1a]"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#0a1e3f]"
        aria-hidden="true"
      />
      <p className="text-sm tracking-wide text-[#555555]">{copy.loading}</p>
    </main>
  );
}
