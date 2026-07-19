"use client";

import { useLocale } from "next-intl";

import { getCommonCopy } from "@/data/siteCopy";

// Client component on purpose: loading.tsx is the Suspense fallback for the
// whole [locale] segment and receives no `params`, so it cannot use
// setRequestLocale. The server `getLocale()` reads request headers, which opts
// the entire segment into dynamic rendering. useLocale() reads the locale from
// NextIntlClientProvider (set with an explicit, static locale in the layout),
// keeping every route statically renderable.
export default function LocaleLoading() {
  const locale = useLocale();
  const copy = getCommonCopy(locale);

  return (
    // Keep the footer below the first viewport while the route stream is
    // pending. A shorter fallback briefly exposed the footer, then pushed it
    // down when the home page arrived and caused a large layout shift.
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-[100svh] flex-col items-center justify-center gap-6 bg-white px-6 py-24 text-center text-[#1a1a1a]"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#0a1e3f]"
        aria-hidden="true"
      />
      <p className="text-sm tracking-wide text-[#555555]">{copy.loading}</p>
    </main>
  );
}
