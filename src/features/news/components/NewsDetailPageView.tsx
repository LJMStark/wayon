import Image from "next/image";
import { Calendar, ChevronLeft, Tag } from "lucide-react";
import { PortableText } from "next-sanity";
import type { PortableTextComponents } from "next-sanity";

import { Link } from "@/i18n/routing";
import { urlFor } from "@/sanity/lib/image";

import type { NewsDetailPageData } from "../types";

type PortableTextImageValue = {
  _type: "image";
  alt?: string;
  asset?: string | { _ref?: string; _id?: string };
};

function hasValidImageAsset(asset: PortableTextImageValue["asset"]): boolean {
  if (!asset) {
    return false;
  }

  if (typeof asset === "string") {
    return asset.trim().length > 0;
  }

  return Boolean(
    (typeof asset._ref === "string" && asset._ref.trim().length > 0) ||
      (typeof asset._id === "string" && asset._id.trim().length > 0)
  );
}

const newsBodyComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const imageValue = value as PortableTextImageValue;

      if (!hasValidImageAsset(imageValue?.asset)) {
        return null;
      }

      const imageUrl = urlFor(imageValue).width(1200).auto("format").url();

      if (!imageUrl) {
        return null;
      }

      return (
        <figure className="my-8 overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={imageValue.alt || ""}
            width={1200}
            height={675}
            className="h-auto w-full object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </figure>
      );
    },
  },
};

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
  return (
    <article className="min-h-screen bg-white">
      <section className="relative h-[350px] w-full bg-neutral-200 md:h-[450px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-10 text-center text-white">
          {categoryLabel ? (
            <span className="mb-4 inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Tag className="mr-1.5 h-3 w-3" />
              {categoryLabel}
            </span>
          ) : null}
          <h1 className="mb-4 max-w-3xl text-3xl font-heading font-bold md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="mr-2 h-4 w-4" />
            {dateLabel}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl border-b border-gray-100 px-6 py-4 text-[13px] text-gray-500">
        <Link
          href="/news"
          className="inline-flex items-center transition-colors hover:text-primary"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {backToNewsLabel}
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        {excerpt ? (
          <p className="mb-12 border-l-4 border-gold pl-6 text-lg font-light leading-relaxed text-gray-600">
            {excerpt}
          </p>
        ) : null}

        {body.length > 0 ? (
          <div className="prose prose-lg max-w-none text-gray-700 prose-headings:font-heading prose-headings:text-primary prose-a:text-gold prose-img:rounded-lg">
            <PortableText value={body} components={newsBodyComponents} />
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-neutral-50 text-gray-400">
            <p className="text-center text-sm">Content coming soon...</p>
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
