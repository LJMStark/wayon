"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/routing";
import { getCommonCopy } from "@/data/siteCopy";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: ErrorProps) {
  const locale = useLocale();
  const copy = getCommonCopy(locale);

  useEffect(() => {
    // Surface the error with its digest so Vercel function logs can be
    // correlated with what the visitor saw.
    console.error("Locale error boundary caught:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-6 py-24 text-center text-[#1a1a1a]">
      <h1 className="text-3xl font-normal tracking-wide md:text-4xl">
        {copy.errorTitle}
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
        {copy.errorMessage}
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-[#666666]">
          ref: {error.digest}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-[#0a1e3f] px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-black"
        >
          {copy.tryAgain}
        </button>
        <Link
          href="/"
          className="border border-[#0a1e3f] px-6 py-3 text-sm font-medium uppercase tracking-wide text-[#0a1e3f] transition-colors hover:bg-[#0a1e3f] hover:text-white"
        >
          {copy.backToHome}
        </Link>
      </div>
    </main>
  );
}
