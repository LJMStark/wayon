import { ArrowRight } from "lucide-react";

import type { AboutIntroData } from "@/data/home";
import { Link } from "@/i18n/routing";

import { RevealSection } from "./RevealSection";

type AboutIntroProps = {
  data: AboutIntroData;
};

export function AboutIntro({ data }: AboutIntroProps): React.JSX.Element {
  return (
    <RevealSection className="relative z-0 py-16 text-[#242424] md:py-20 lg:py-28" amount={0.2}>
      <div className="mx-auto max-w-[80rem] px-6 text-center">
        <h2 className="mx-auto mb-10 max-w-5xl text-[clamp(2.5rem,6vw,5.5rem)] font-light uppercase leading-[1.1] tracking-wide text-[color:var(--primary)]">
          {data.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto text-left">
          {data.paragraphs.map((paragraph, index) => (
            <p key={paragraph} className={`text-[15px] leading-relaxed text-[#4a4a4a] ${index === 0 ? "text-[16px] font-medium text-[#242424]" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href={data.href} className="group relative inline-flex w-fit items-center gap-4 pb-3 text-sm uppercase tracking-[0.2em] text-[color:var(--primary)]">
            <span className="relative z-10">{data.cta}</span>
            <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[color:var(--primary)]/35 transition-colors duration-300 group-hover:bg-[color:var(--primary)]" />
            <ArrowRight className="size-4 relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
