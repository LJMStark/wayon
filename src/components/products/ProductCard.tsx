import Image from "next/image";

import { Link } from "@/i18n/routing";

type ProductCardProps = {
  title: string;
  image?: string;
  slug: string;
  category: string;
  summaryTags: string[];
};

const CARD_CLASS_NAME =
  "group flex h-full flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5";

export default function ProductCard({
  title,
  image,
  slug,
  category,
  summaryTags,
}: ProductCardProps): React.JSX.Element {
  const detailsHref = `/products/${slug}`;

  return (
    <div className={CARD_CLASS_NAME}>
      <Link
        href={detailsHref}
        className="relative block aspect-[4/3] cursor-pointer overflow-hidden bg-neutral-100"
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f4f4f4,#e8eaed)]" />
        )}
      </Link>

      <div className="flex grow flex-col p-6">
        <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
          {category}
        </span>
        <h3 className="mb-5 text-2xl font-heading font-semibold text-[#1a1a1a]">
          {title}
        </h3>

        {summaryTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summaryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

