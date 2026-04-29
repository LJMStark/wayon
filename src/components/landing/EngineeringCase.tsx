import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import type { CaseItem } from "@/data/home";
import { RevealSection } from "./RevealSection";

type EngineeringCaseProps = {
  title: string;
  subtitle: string;
  items: CaseItem[];
};

export function EngineeringCase({
  title,
  subtitle,
  items,
}: EngineeringCaseProps): React.JSX.Element {
  return (
    <RevealSection id="case" className="overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-[1920px] px-4 md:px-8">
        <header className="mb-12 flex flex-col justify-between gap-8 border-b border-[#002b50]/12 pb-8 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-[clamp(2.5rem,5vw,4.5rem)] font-light uppercase leading-[1.1] tracking-wide text-[color:var(--primary)]">
              {title}
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-[#4a4a4a]">
              {subtitle}
            </p>
          </div>
        </header>
      </div>

      <div
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 pb-6 md:gap-8 md:px-8 lg:px-12 xl:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            role="listitem"
            className="wayon-snap-card group relative aspect-[4/5] w-[80vw] shrink-0 snap-center overflow-hidden border border-[#002b50]/10 bg-white shadow-[0_24px_80px_-56px_rgba(0,43,80,0.42)] sm:w-[60vw] md:w-[44vw] lg:w-[34vw] xl:w-[26vw]"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, (max-width: 1024px) 44vw, (max-width: 1280px) 34vw, 26vw"
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002b50]/90 via-[#002b50]/25 to-transparent opacity-70 transition-opacity duration-700 md:opacity-55 md:group-hover:opacity-90" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-8 transition-[transform,opacity] duration-700 ease-[0.16,1,0.3,1] md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
              <h3 className="text-2xl font-light tracking-wide text-white mb-6 uppercase">
                {item.title}
              </h3>
              <div className="flex size-12 shrink-0 items-center justify-center border border-white/35 text-white transition-colors duration-500 hover:bg-white hover:text-[color:var(--primary)]">
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </div>
            </div>
          </a>
        ))}

        <div className="shrink-0 w-4 md:w-8" aria-hidden />
      </div>
    </RevealSection>
  );
}
