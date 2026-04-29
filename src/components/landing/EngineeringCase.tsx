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

  // Assign varying aspect ratios for masonry effect
  const getAspectRatio = (index: number) => {
    const ratios = [
      "aspect-[4/5]", "aspect-[16/9]", "aspect-[3/4]",
      "aspect-[1/1]", "aspect-[4/3]", "aspect-[9/16]"
    ];
    return ratios[index % ratios.length];
  };

  return (
    <RevealSection id="case" className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1920px]">
        <header className="mb-16 flex flex-col justify-between gap-8 border-b border-[#002b50]/12 pb-8 md:mb-24 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-[clamp(2.5rem,5vw,4.5rem)] font-light uppercase leading-[1.1] tracking-wide text-[color:var(--primary)]">
              {title}
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-[#4a4a4a]">
              {subtitle}
            </p>
          </div>
        </header>

        {/* Masonry Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:gap-y-8">
          {items.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group relative block break-inside-avoid overflow-hidden border border-[#002b50]/10 bg-white shadow-[0_24px_80px_-56px_rgba(0,43,80,0.42)]"
            >
              <div className={`relative w-full ${getAspectRatio(index)}`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002b50]/90 via-[#002b50]/20 to-transparent opacity-55 transition-opacity duration-700 group-hover:opacity-90" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end translate-y-4 opacity-0 transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-2xl font-light tracking-wide text-white mb-6 uppercase">
                    {item.title}
                  </h3>
                  <div className="flex size-12 shrink-0 items-center justify-center border border-white/35 text-white transition-colors duration-500 hover:bg-white hover:text-[color:var(--primary)]">
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
