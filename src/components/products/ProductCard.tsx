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
  "group flex h-full flex-col overflow-hidden border border-[color:var(--border)] bg-white transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-[color:var(--primary)]/25 hover:shadow-[0_24px_60px_-30px_rgba(0,43,80,0.25)]";

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
        className="relative block aspect-[4/3] cursor-pointer overflow-hidden bg-[color:var(--surface)]"
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-[color:var(--surface)] text-[10px] font-medium uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]/40"
          >
            ZYL
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </Link>

      <div className="flex grow flex-col p-6 md:p-7">
        <span className="wayon-eyebrow mb-3">{category}</span>
        <h3 className="mb-5 font-heading text-[1.5rem] font-medium leading-[1.15] tracking-[-0.01em] text-[#242424]">
          {title}
        </h3>

        {summaryTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summaryTags.map((tag) => (
              <span
                key={tag}
                className="border border-[color:var(--border)] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]"
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

