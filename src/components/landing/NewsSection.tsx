import Image from "next/image";

import type { NewsFeature, NewsItem } from "@/data/home";
import { Link } from "@/i18n/routing";

import { RevealSection } from "./RevealSection";

type NewsSectionProps = {
  title: string;
  feature: NewsFeature | null;
  items: NewsItem[];
};

export function NewsSection({
  title,
  feature,
  items,
}: NewsSectionProps): React.JSX.Element | null {
  if (!feature) {
    return null;
  }

  return (
    <RevealSection className="py-24 md:py-32 bg-[#09090b] px-4 lg:px-8 border-t border-white/5">
      <div className="mx-auto max-w-[90rem]">
        <header className="mb-16 md:mb-20">
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light tracking-widest text-white uppercase leading-none">
            {title}
          </h2>
        </header>

        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] xl:gap-24">
          {/* Featured Article */}
          <article>
            <Link href={feature.href} className="group block h-full flex flex-col">
              <div className="relative mb-8 aspect-[16/7] md:aspect-[21/9] lg:aspect-[16/10] overflow-hidden bg-[#121214] border border-white/5">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[2s] ease-[0.16,1,0.3,1] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              </div>
              <h3 className="text-[clamp(1.5rem,2.5vw,2rem)] font-light leading-[1.3] text-white tracking-wide transition-colors group-hover:text-white/70">
                {feature.title}
              </h3>
              <p className="mt-6 text-[15px] font-normal leading-[1.8] text-white/60 line-clamp-3 max-w-xl">
                {feature.excerpt}
              </p>
            </Link>
          </article>

          {/* News List */}
          <div>
            <ul className="border-t border-white/10">
              {items.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12 border-b border-white/10 py-8 md:py-10 transition-colors hover:bg-white/[0.02] px-2 md:px-6"
                  >
                    <time
                      dateTime={`${item.yearMonth}-${String(item.day).padStart(2, "0")}`}
                      className="shrink-0 flex items-baseline gap-4 text-white/60 group-hover:text-white transition-colors duration-500"
                    >
                      <span className="block text-[clamp(4rem,6vw,6rem)] font-light leading-[0.8] tracking-tighter tabular-nums">
                        {String(item.day).padStart(2, "0")}
                      </span>
                      <span className="text-xs tracking-[0.3em] uppercase">{item.yearMonth}</span>
                    </time>
                    <h3 className="w-full text-[18px] md:text-[22px] font-light leading-[1.5] text-white/80 group-hover:text-white transition-colors duration-500">
                      {item.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
