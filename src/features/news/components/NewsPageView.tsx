import Image from "next/image";
import { ArrowUpRight, Calendar } from "lucide-react";

import { Link } from "@/i18n/routing";

import { getNewsHref } from "../model/news-view";
import type { NewsPageData, NewsPreviewItem } from "../types";

const NEWS_FALLBACK_HERO = "/assets/news/news-feature.jpg";

export function NewsPageView({
  eyebrow,
  heroTitle,
  heroDescription,
  recentUpdatesLabel,
  featured,
  recent,
  emptyMessage,
}: NewsPageData): React.JSX.Element {
  const allNews = featured ? [featured, ...recent] : recent;
  const heroImage = featured?.image ?? NEWS_FALLBACK_HERO;

  return (
    <div className="min-h-screen wayon-stone-bg">
      <section className="relative -mt-[var(--header-height)] overflow-hidden bg-[#031f36] text-white">
        <Image
          src={heroImage}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover opacity-28 saturate-75"
          unoptimized
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,24,44,0.96)_0%,rgba(0,43,80,0.86)_48%,rgba(0,24,44,0.54)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.1))]"
        />

        <div className="wayon-container-wide relative grid min-h-[600px] items-end gap-10 pb-14 pt-[calc(var(--header-height)+5rem)] md:pb-16 md:pt-[calc(var(--header-height)+6rem)] xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-center">
          <div className="max-w-3xl pb-2">
            <span className="text-sm font-semibold text-[#d9b45b]">
              {eyebrow}
            </span>
            <h1 className="wayon-page-title mt-6 text-4xl font-normal leading-tight text-white md:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              {heroDescription}
            </p>
          </div>

          {featured ? <FeaturedNewsCard item={featured} /> : null}
        </div>
      </section>

      {allNews.length > 0 ? (
        <section className="bg-white/94 py-20 md:py-28">
          <div className="wayon-container-wide grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="border-s border-[#002b50]/15 ps-6">
                <span className="text-sm font-semibold text-[#d9b45b]">
                  {eyebrow}
                </span>
                <h2 className="mt-4 text-3xl font-heading font-normal leading-tight text-[#002b50] md:text-4xl">
                  {recentUpdatesLabel}
                </h2>
                <div className="mt-8 flex items-end gap-3 text-[#002b50]">
                  <span className="font-heading text-6xl font-normal leading-none tabular-nums">
                    {String(allNews.length).padStart(2, "0")}
                  </span>
                  <span className="mb-2 h-px w-16 bg-[#d9b45b]" />
                </div>
              </div>
            </aside>

            <div className="border-t border-[#002b50]/12">
              {allNews.map((item, index) => (
                <NewsIndexRow
                  key={item.slug}
                  item={item}
                  priority={index === 0}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white/94 py-24">
          <div className="wayon-container-wide">
            <div className="border border-[#002b50]/12 bg-white px-6 py-16 text-center shadow-[0_24px_70px_-52px_rgba(0,43,80,0.45)]">
              <h2 className="text-3xl font-heading font-normal text-[#002b50]">
                {recentUpdatesLabel}
              </h2>
              <p className="mt-4 text-[#4a4a4a]">{emptyMessage}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FeaturedNewsCard({
  item,
}: {
  item: NewsPreviewItem;
}): React.JSX.Element {
  return (
    <article
      id={item.slug}
      className="w-full max-w-[520px] xl:me-24 xl:justify-self-end"
    >
      <Link
        href={getNewsHref(item.slug)}
        className="group block overflow-hidden rounded-lg border border-white/18 bg-white/10 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.95)] backdrop-blur-md transition-transform duration-500 hover:-translate-y-1"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#002b50]">
          <Image
            src={item.image}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 520px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(0,24,44,0.58)_100%)]"
          />
        </div>
        <div className="p-6 md:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/72">
            {item.category ? (
              <span className="rounded-full bg-[#d9b45b] px-3 py-1 text-xs font-semibold text-[#002b50]">
                {item.category}
              </span>
            ) : null}
            <time dateTime={item.dateTime} className="inline-flex items-center">
              <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
              {item.date}
            </time>
          </div>
          <h2 className="text-2xl font-heading font-normal leading-snug text-white md:text-3xl">
            {item.title}
          </h2>
          {item.excerpt ? (
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/72 md:text-[15px]">
              {item.excerpt}
            </p>
          ) : null}
          <span
            aria-hidden
            className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/24 text-white transition-colors duration-300 group-hover:border-[#d9b45b] group-hover:bg-[#d9b45b] group-hover:text-[#002b50]"
          >
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </article>
  );
}

function NewsIndexRow({
  item,
  priority = false,
}: {
  item: NewsPreviewItem;
  priority?: boolean;
}): React.JSX.Element {
  return (
    <article id={priority ? undefined : item.slug}>
      <Link
        href={getNewsHref(item.slug)}
        className="group grid gap-6 border-b border-[#002b50]/12 py-7 transition-colors duration-300 hover:bg-[#f7fafd] md:grid-cols-[110px_minmax(0,1fr)_180px_48px] md:items-center md:px-4 lg:grid-cols-[120px_minmax(0,1fr)_220px_52px] lg:py-9"
      >
        <time
          dateTime={item.dateTime}
          className="flex items-baseline gap-3 text-[#002b50]"
        >
          <span className="font-heading text-5xl font-normal leading-none tabular-nums">
            {item.dateDay}
          </span>
          <span className="max-w-20 text-xs leading-5 text-[#4a4a4a]">
            {item.dateYearMonth}
          </span>
        </time>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#4a4a4a]">
            {item.category ? (
              <span className="font-semibold text-[#9b7b31]">
                {item.category}
              </span>
            ) : null}
            <span>{item.date}</span>
          </div>
          <h3 className="text-2xl font-heading font-normal leading-snug text-[#242424] transition-colors duration-300 group-hover:text-[#002b50]">
            {item.title}
          </h3>
          {item.excerpt ? (
            <p className="mt-3 line-clamp-2 max-w-3xl text-[15px] leading-7 text-[#4a4a4a]">
              {item.excerpt}
            </p>
          ) : null}
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f7fafd] md:block">
          <Image
            src={item.image}
            alt=""
            fill
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, 220px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
        </div>

        <span
          aria-hidden
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#002b50]/18 text-[#002b50] transition-colors duration-300 group-hover:border-[#002b50] group-hover:bg-[#002b50] group-hover:text-white"
        >
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </Link>
    </article>
  );
}
