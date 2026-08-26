import Image from "next/image";
import { Calendar, ChevronLeft, Tag } from "lucide-react";
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";

import { Link } from "@/i18n/routing";

import type {
  NewsArticleContentBlock,
  NewsArticleVisual,
  NewsDetailPageData,
} from "../types";

const articleRichTextConverters: JSXConvertersFunction = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  upload: (args) => {
    const uploadDoc = args.node.value;
    if (
      uploadDoc &&
      typeof uploadDoc === "object" &&
      "mimeType" in uploadDoc &&
      typeof uploadDoc.mimeType === "string" &&
      uploadDoc.mimeType.startsWith("video") &&
      "url" in uploadDoc &&
      typeof uploadDoc.url === "string"
    ) {
      return (
        <video
          controls
          playsInline
          className="mx-auto my-8 block w-full max-w-3xl rounded-lg"
          src={uploadDoc.url}
        />
      );
    }
    const fallback = defaultConverters.upload;
    return typeof fallback === "function" ? fallback(args) : (fallback ?? null);
  },
});

export function NewsDetailPageView({
  backToNewsLabel,
  contactCtaTitle,
  contactLabel,
  contentComingSoonLabel,
  title,
  excerpt,
  body,
  imageUrl,
  visuals,
  contentBlocks,
  dateLabel,
  categoryLabel,
}: NewsDetailPageData): React.JSX.Element {
  const hasBody =
    body !== null && Array.isArray(body.root?.children) && body.root.children.length > 0;
  const hasContentBlocks = contentBlocks.length > 0;

  return (
    <article className="min-h-screen zyl-stone-bg">
      {imageUrl ? (
        <section className="relative -mt-[var(--header-height)] h-[360px] w-full overflow-hidden bg-neutral-900 md:h-[480px]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </section>
      ) : (
        <div className="h-[var(--header-height)] bg-primary" />
      )}

      {/* Flat white reading surface — overrides the body::before marble bg
          so long-form prose doesn't have to compete with stone veining. */}
      <div className="bg-white">
        <div className="mx-auto max-w-5xl border-b border-gray-100 px-6 py-4 text-[13px] text-[#555555]">
          <Link
            href="/news"
            className="inline-flex items-center transition-colors hover:text-primary"
          >
            <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {backToNewsLabel}
          </Link>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="mb-10 border-b border-gray-100 pb-8 text-center">
            {categoryLabel ? (
              <span className="mb-4 inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Tag className="me-1.5 h-3 w-3" aria-hidden="true" />
                {categoryLabel}
              </span>
            ) : null}
            <h1 className="zyl-page-title zyl-brand-title mb-4 text-3xl font-normal text-primary md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <div className="flex items-center justify-center text-sm text-[#666666]">
              <Calendar className="me-2 h-4 w-4" aria-hidden="true" />
              {dateLabel}
            </div>
          </div>

          {excerpt ? (
            <p className="mx-auto mb-12 max-w-3xl border-s-4 border-gold ps-6 text-lg font-normal leading-relaxed text-gray-600">
              {excerpt}
            </p>
          ) : null}

          {hasContentBlocks ? (
            <ArticleContentBlocks blocks={contentBlocks} />
          ) : (
            <>
              {visuals.length > 0 ? <ArticleVisualDeck visuals={visuals} /> : null}

              {hasBody && body ? (
                <ArticleProse body={body} />
              ) : (
                <div className="mx-auto flex min-h-[200px] max-w-3xl items-center justify-center rounded-lg bg-neutral-50 text-[#666666]">
                  <p className="text-center text-sm">{contentComingSoonLabel}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <section className="bg-primary px-6 pb-6 pt-10 md:pb-8 md:pt-14">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="zyl-brand-title mb-5 text-2xl text-white">
            {contactCtaTitle}
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

function ArticleContentBlocks({
  blocks,
}: {
  blocks: NewsArticleContentBlock[];
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {blocks.map((block, index) => {
        if (block.type === "body") {
          return <ArticleProse key={`body-${index}`} body={block.body} compact />;
        }

        return (
          <ArticleInlineVisual
            key={block.visual.src}
            visual={block.visual}
            priority={index < 3}
          />
        );
      })}
    </div>
  );
}

function ArticleInlineVisual({
  visual,
  priority = false,
}: {
  visual: NewsArticleVisual;
  priority?: boolean;
}): React.JSX.Element {
  return (
    <figure>
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-contain"
          priority={priority}
        />
      </div>
      <figcaption className="pt-3 text-center text-sm leading-6 text-[#666666]">
        {visual.caption || visual.alt}
      </figcaption>
    </figure>
  );
}

function ArticleProse({
  body,
  compact = false,
}: {
  body: NewsDetailPageData["body"];
  compact?: boolean;
}): React.JSX.Element {
  if (!body) {
    return <></>;
  }

  const proseBase =
    "zyl-article-prose text-[17px] leading-9 text-gray-700 [&_a]:font-medium [&_a]:text-gold [&_a:hover]:text-primary [&_h2]:mb-5 [&_h2]:mt-14 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-primary [&_h3]:mb-4 [&_h3]:mt-10 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-2 [&_strong]:font-semibold [&_strong]:text-primary [&_ul]:mb-8 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6";

  return (
    <div
      className={`${proseBase} ${compact ? "[&_p]:mb-0" : "mx-auto max-w-3xl [&_p]:mb-6"}`}
    >
      <RichText data={body} converters={articleRichTextConverters} />
    </div>
  );
}

function ArticleVisualDeck({
  visuals,
}: {
  visuals: NewsArticleVisual[];
}): React.JSX.Element {
  const [featured, ...supporting] = visuals;

  if (!featured) {
    return <></>;
  }

  if (supporting.length === 0) {
    return (
      <section className="mx-auto mb-14 max-w-3xl">
        <ArticleVisualCard visual={featured} priority />
      </section>
    );
  }

  return (
    <section className="mx-auto mb-14 max-w-4xl space-y-4">
      <ArticleVisualCard visual={featured} priority />
      <div className="space-y-4">
        {supporting.map((visual) => (
          <ArticleVisualCard key={visual.src} visual={visual} />
        ))}
      </div>
    </section>
  );
}

function ArticleVisualCard({
  visual,
  priority = false,
}: {
  visual: NewsArticleVisual;
  priority?: boolean;
}): React.JSX.Element {
  return (
    <figure className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-[0_18px_60px_rgba(0,43,80,0.08)]">
      <div className="relative aspect-[3/2] bg-neutral-50">
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes="(max-width: 768px) 100vw, 620px"
          className="object-contain"
          priority={priority}
        />
      </div>
      {visual.caption ? (
        <figcaption className="px-4 py-3 text-center text-sm leading-6 text-[#666666]">
          {visual.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
