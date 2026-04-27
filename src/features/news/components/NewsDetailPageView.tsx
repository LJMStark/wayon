import Image from "next/image";
import { Calendar, ChevronLeft, Tag } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { Link } from "@/i18n/routing";

import type { NewsDetailPageData } from "../types";

export function NewsDetailPageView({
  backToNewsLabel,
  contactLabel,
  title,
  excerpt,
  body,
  imageUrl,
  dateLabel,
  categoryLabel,
}: NewsDetailPageData): React.JSX.Element {
  const hasBody =
    body !== null && Array.isArray(body.root?.children) && body.root.children.length > 0;

  return (
    <article className="min-h-screen wayon-stone-bg">
      <section className="relative -mt-[var(--header-height)] w-full min-h-[430px] md:min-h-[530px] overflow-hidden bg-neutral-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55"
        />
        <div className="relative z-10 flex min-h-[430px] md:min-h-[530px] flex-col items-center justify-center px-6 pt-[var(--header-height)] text-center text-white">
          {categoryLabel ? (
            <span className="mb-4 inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Tag className="me-1.5 h-3 w-3" aria-hidden="true" />
              {categoryLabel}
            </span>
          ) : null}
          <h1 className="mb-4 max-w-3xl font-heading text-3xl font-normal text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <div className="flex items-center text-sm text-white/70">
            <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
            {dateLabel}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl border-b border-gray-100 px-6 py-4 text-[13px] text-[#555555]">
        <Link
          href="/news"
          className="inline-flex items-center transition-colors hover:text-primary"
        >
          <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {backToNewsLabel}
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        {excerpt ? (
          <p className="mb-12 border-s-4 border-gold ps-6 text-lg font-normal leading-relaxed text-gray-600">
            {excerpt}
          </p>
        ) : null}

        {hasBody && body ? (
          <div className="prose prose-lg max-w-none text-gray-700 prose-headings:font-heading prose-headings:text-primary prose-a:text-gold prose-img:rounded-lg">
            <RichText data={body} />
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-neutral-50 text-[#666666]">
            <p className="text-center text-sm">Content coming soon…</p>
          </div>
        )}
      </div>

      <section className="bg-primary py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-2xl font-heading font-bold text-white">
            {contactLabel}
          </h2>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-gold px-8 py-3 text-sm font-medium uppercase tracking-wider text-primary transition-colors hover:bg-yellow-400"
          >
            {contactLabel}
          </Link>
        </div>
      </section>
    </article>
  );
}
