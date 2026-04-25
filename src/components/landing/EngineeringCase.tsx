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
    <RevealSection id="case" className="wayon-section bg-neutral-50/50 px-0">
      <div className="mx-auto max-w-[1920px] px-4 lg:px-8">
        <header className="mb-10 text-center md:mb-14">
          <h2 className="wayon-title text-[color:var(--primary)]">
            {title}
          </h2>
          <p className="wayon-copy mx-auto mt-5 max-w-[780px]">
            {subtitle}
          </p>
        </header>

        {/* 3 columns x 2 rows grid (Pure Tailwind CSS) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-500 hover:shadow-xl"
            >
              <figure className="relative h-full">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                  />
                  {/* Premium Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2336]/90 via-[#0f2336]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                
                {/* Fixed bottom content that moves up nicely on hover */}
                <figcaption className="absolute inset-x-0 bottom-0 flex translate-y-4 items-end justify-between p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-lg font-medium tracking-wide text-white drop-shadow-md lg:text-xl">
                    {item.title}
                  </h3>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-[color:var(--primary)]">
                    <ArrowUpRight className="size-5" />
                  </div>
                </figcaption>
              </figure>
            </a>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
