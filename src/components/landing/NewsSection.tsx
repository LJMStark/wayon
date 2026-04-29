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
    <RevealSection className="border-t border-[#002b50]/10 px-4 py-24 md:py-32 lg:px-8">
      <div className="mx-auto max-w-[90rem]">
        <header className="mb-16 md:mb-20">
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light uppercase leading-none tracking-widest text-[color:var(--primary)]">
            {title}
          </h2>
        </header>

        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] xl:gap-24">
          {/* Featured Article */}
          <article>
            <Link href={feature.href} className="group block h-full flex flex-col">
              <div className="relative mb-8 aspect-[16/7] overflow-hidden border border-[#002b50]/10 bg-white md:aspect-[21/9] lg:aspect-[16/10]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[2s] ease-[0.16,1,0.3,1] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002b50]/35 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              </div>
              <h3 className="text-[clamp(1.5rem,2.5vw,2rem)] font-light leading-[1.3] tracking-wide text-[#242424] transition-colors group-hover:text-[color:var(--primary)]">
                {feature.title}
              </h3>
              <p className="mt-6 line-clamp-3 max-w-xl text-[15px] font-normal leading-[1.8] text-[#4a4a4a]">
                {feature.excerpt}
              </p>
            </Link>
          </article>

          {/* News List */}
          <div>
            <ul className="border-t border-[#002b50]/10">
              {items.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="group flex flex-col items-start justify-between gap-6 border-b border-[#002b50]/10 px-2 py-8 transition-colors hover:bg-white/45 md:flex-row md:items-center md:gap-12 md:px-6 md:py-10"
                  >
                    <time
                      dateTime={`${item.yearMonth}-${String(item.day).padStart(2, "0")}`}
                      className="flex shrink-0 items-baseline gap-4 text-[color:var(--primary)]/65 transition-colors duration-500 group-hover:text-[color:var(--primary)]"
                    >
                      <span className="block text-[clamp(4rem,6vw,6rem)] font-light leading-[0.8] tracking-tighter tabular-nums">
                        {String(item.day).padStart(2, "0")}
                      </span>
                      <span className="text-xs tracking-[0.3em] uppercase">{item.yearMonth}</span>
                    </time>
                    <h3 className="w-full text-[18px] font-light leading-[1.5] text-[#333333] transition-colors duration-500 group-hover:text-[color:var(--primary)] md:text-[22px]">
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
