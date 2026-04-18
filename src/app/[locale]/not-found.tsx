import { getLocale } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { getCommonCopy } from "@/data/siteCopy";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const copy = getCommonCopy(locale);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-6 py-24 text-center text-[#1a1a1a]">
      <p className="text-6xl font-extralight tracking-widest text-[#0a1e3f]">
        404
      </p>
      <h1 className="text-3xl font-light tracking-wide md:text-4xl">
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
