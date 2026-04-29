import { ArrowRight } from "lucide-react";

import type { AboutIntroData } from "@/data/home";
import { Link } from "@/i18n/routing";

import { RevealSection } from "./RevealSection";

type AboutIntroProps = {
  data: AboutIntroData;
};

export function AboutIntro({ data }: AboutIntroProps): React.JSX.Element {
  return (
    <RevealSection className="py-24 md:py-32 lg:py-48 bg-[#09090b] text-white relative z-0" amount={0.2}>
      <div className="mx-auto max-w-[80rem] px-6 text-center">
        <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-light tracking-wide leading-[1.1] mb-12 uppercase mx-auto max-w-5xl">
          {data.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto text-left">
          {data.paragraphs.map((paragraph, index) => (
            <p key={paragraph} className={`text-white/60 text-[15px] leading-relaxed ${index === 0 ? "text-[16px] text-white/90 font-medium" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href={data.href} className="group relative inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase text-white pb-3 w-fit">
            <span className="relative z-10">{data.cta}</span>
            <span className="absolute bottom-0 left-0 h-[1px] w-full bg-white/30 transition-colors duration-300 group-hover:bg-white" />
            <ArrowRight className="size-4 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
