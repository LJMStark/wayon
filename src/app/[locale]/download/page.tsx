import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/routing";
import { getCommonCopy, getDownloadPageCopy } from "@/data/siteCopy";
import { getMetadataCopy } from "@/data/siteCopy";
import { buildPageMetadata } from "@/lib/metadata";
import { hasLocale } from "@/i18n/types";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/download">) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const metadataCopy = getMetadataCopy(locale).download;

  return buildPageMetadata({
    locale,
    title: metadataCopy.title,
    description: metadataCopy.description,
    path: "/download",
  });
}

export default async function DownloadPage({
  params,
}: PageProps<"/[locale]/download">) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const commonCopy = getCommonCopy(locale);
  const downloadCopy = getDownloadPageCopy(locale);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#1a1a1a] py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-heading font-bold uppercase tracking-wide text-white md:text-5xl">
            {downloadCopy.heroTitle}
          </h1>
          <p className="max-w-xl text-sm font-light text-gray-400">
            {downloadCopy.heroDescription}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {downloadCopy.catalogs.map((catalog: {
            title: string;
            description: string;
            size: string;
            year: string;
          }) => (
            <div
              key={catalog.title}
              className="group flex flex-col border border-gray-200 p-8 transition-all duration-300 hover:border-[#1a1a1a] hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  PDF
                </span>
                <span className="text-[11px] text-gray-400">{catalog.year}</span>
              </div>

              <h3 className="mb-3 font-heading text-lg font-bold text-[#1a1a1a]">
                {catalog.title}
              </h3>

              <p className="mb-6 grow text-sm font-light leading-relaxed text-gray-500">
                {catalog.description}
              </p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-[11px] text-gray-400">{catalog.size}</span>
                <Link
                  href="/contact"
                  className="inline-flex items-center text-sm font-medium text-[#1a1a1a] transition-colors group-hover:text-gray-600"
                >
                  {downloadCopy.requestCatalog}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-[1400px] px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-heading font-bold uppercase text-[#1a1a1a]">
            {downloadCopy.ctaTitle}
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm font-light text-gray-500">
            {downloadCopy.ctaDescription}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-[#1a1a1a] px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
          >
            {commonCopy.contactUs}
          </Link>
        </div>
      </section>
    </div>
  );
}
