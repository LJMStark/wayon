import { getLocale } from "next-intl/server";

import { getCommonCopy } from "@/data/siteCopy";

export default async function LocaleLoading() {
  const locale = await getLocale();
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
      <p className="text-sm tracking-wide text-gray-500">{copy.loading}</p>
    </main>
  );
}
