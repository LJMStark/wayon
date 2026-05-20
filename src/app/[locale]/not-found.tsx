"use client";

import { useLocale } from "next-intl";

import { Link } from "@/i18n/routing";
import { getCommonCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

// Client component on purpose: not-found.tsx receives no `params`, so the server
// `getLocale()` reads request headers and opts the segment into dynamic
// rendering. useLocale() reads from NextIntlClientProvider (static locale set in
// the layout), keeping routes statically renderable.
export default function LocaleNotFound() {
  const locale = useLocale() as AppLocale;
  const copy = getCommonCopy(locale);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-6 py-24 text-center text-[#1a1a1a]">
      <p className="text-6xl font-extralight tracking-widest text-[#0a1e3f]">
        404
      </p>
      <h1 className="text-3xl font-normal tracking-wide md:text-4xl">
        {copy.notFoundTitle}
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
        {copy.notFoundMessage}
      </p>
      <Link
        href="/"
        className="bg-[#0a1e3f] px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-black"
      >
        {copy.backToHome}
      </Link>
    </main>
  );
}
