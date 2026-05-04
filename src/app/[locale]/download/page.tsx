import { ArrowRight, Download, FileCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/routing";
import {
  getCommonCopy,
  getDownloadPageCopy,
  getMetadataCopy,
} from "@/data/siteCopy";
import { buildPageMetadata } from "@/lib/metadata";
import { hasLocale } from "@/i18n/types";

type DownloadCatalog = {
  title: string;
  description: string;
  size: string;
  year: string;
};

type DownloadCertification = {
  title: string;
  description: string;
  issuer: string;
  reportNumber: string;
  year: string;
  size: string;
  downloadUrl: string;
};

type DownloadCatalogCardProps = {
  catalog: DownloadCatalog;
  requestCatalogLabel: string;
};

type DownloadCertCardProps = {
  cert: DownloadCertification;
  downloadLabel: string;
};

function DownloadCatalogCard({
  catalog,
  requestCatalogLabel,
}: DownloadCatalogCardProps): React.JSX.Element {
  return (
    <div className="group flex flex-col border border-gray-200 p-8 transition-[border-color,box-shadow] duration-300 hover:border-[#1a1a1a] hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#666666]">
          PDF
        </span>
        <span className="text-[11px] text-[#666666]">{catalog.year}</span>
      </div>

      <h3 className="mb-3 font-heading text-lg font-bold text-[#1a1a1a]">
        {catalog.title}
      </h3>

      <p className="mb-6 grow text-sm font-normal leading-relaxed text-[#555555]">
        {catalog.description}
      </p>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-[11px] text-[#666666]">{catalog.size}</span>
        <Link
          href="/contact"
          className="inline-flex items-center text-sm font-medium text-[#1a1a1a] transition-colors group-hover:text-gray-600"
        >
          {requestCatalogLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function DownloadCertCard({
  cert,
  downloadLabel,
}: DownloadCertCardProps): React.JSX.Element {
  return (
    <div className="group flex flex-col border border-gray-200 p-8 transition-[border-color,box-shadow] duration-300 hover:border-[#1a1a1a] hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 bg-[#f0f7f0] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3a7a3a]">
          <FileCheck className="h-3 w-3" />
          PDF
        </span>
        <span className="text-[11px] text-[#666666]">{cert.year}</span>
      </div>

      <h3 className="mb-3 font-heading text-lg font-bold text-[#1a1a1a]">
        {cert.title}
      </h3>

      <p className="mb-3 grow text-sm font-normal leading-relaxed text-[#555555]">
        {cert.description}
      </p>

      <p className="mb-6 text-[11px] text-[#888888]">
        {cert.issuer} · {cert.reportNumber}
      </p>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-[11px] text-[#666666]">{cert.size}</span>
        <a
          href={cert.downloadUrl}
          download
          className="inline-flex items-center text-sm font-medium text-[#1a1a1a] transition-colors group-hover:text-gray-600"
        >
          {downloadLabel}
          <Download className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/download">): Promise<import("next").Metadata> {
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
}: PageProps<"/[locale]/download">): Promise<React.JSX.Element> {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const commonCopy = getCommonCopy(locale);
  const downloadCopy = getDownloadPageCopy(locale);

  return (
    <div className="min-h-screen wayon-stone-bg">
      <section className="bg-[#1a1a1a] -mt-[var(--header-height)] pb-20 pt-[calc(var(--header-height)+80px)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h1 className="wayon-page-title mb-4 text-4xl font-normal uppercase tracking-wide text-white md:text-5xl">
            {downloadCopy.heroTitle}
          </h1>
          <p className="max-w-xl text-sm font-normal text-[#666666]">
            {downloadCopy.heroDescription}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {downloadCopy.catalogs.map((catalog: DownloadCatalog) => (
            <DownloadCatalogCard
              key={catalog.title}
              catalog={catalog}
              requestCatalogLabel={downloadCopy.requestCatalog}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="wayon-brand-title mb-3 text-2xl uppercase text-[#1a1a1a]">
              {downloadCopy.certificationsTitle}
            </h2>
            <p className="max-w-xl text-sm font-normal text-[#555555]">
              {downloadCopy.certificationsDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {downloadCopy.certifications.map(
              (cert: DownloadCertification) => (
                <DownloadCertCard
                  key={cert.reportNumber}
                  cert={cert}
                  downloadLabel={downloadCopy.downloadReport}
                />
              )
            )}
          </div>
        </div>
      </section>

      <section className="wayon-stone-bg border-t border-gray-100 py-16">
        <div className="mx-auto max-w-[1400px] px-4 text-center sm:px-6 lg:px-8">
          <h2 className="wayon-brand-title mb-4 text-2xl uppercase text-[#1a1a1a]">
            {downloadCopy.ctaTitle}
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm font-normal text-[#555555]">
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
