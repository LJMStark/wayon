import { ArrowRight, Factory, Headphones, Warehouse } from "lucide-react";
import Image from "next/image";

import type { AboutIntroData } from "@/data/home";
import { Link } from "@/i18n/routing";

import { RevealSection } from "./RevealSection";

type AboutIntroProps = {
  data: AboutIntroData;
};

const FEATURE_ICONS = [Warehouse, Factory, Headphones] as const;

export function AboutIntro({ data }: AboutIntroProps): React.JSX.Element {
  return (
    <RevealSection
      className="relative z-0 overflow-hidden py-16 text-[#242424] md:py-20 lg:py-28"
      amount={0.2}
    >
      <div className="absolute inset-x-0 top-[18%] h-[58%] bg-white/64" />

      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="relative grid overflow-hidden bg-white shadow-[0_30px_110px_-58px_rgba(0,43,80,0.42)] lg:grid-cols-[minmax(0,1.14fr)_minmax(27rem,0.86fr)]">
          <div className="relative overflow-hidden px-6 py-10 sm:px-9 md:px-11 lg:px-12 lg:py-14">
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute right-[-4rem] top-[-2rem] h-[24rem] w-[30rem] bg-[radial-gradient(circle,rgba(0,43,80,0.08)_1.2px,transparent_1.2px)] [background-size:10px_10px] [mask-image:radial-gradient(ellipse_at_center,#000_0%,transparent_70%)]" />
              <div className="absolute inset-y-0 left-0 w-2 bg-[color:var(--primary)]/5" />
            </div>

            <div className="relative">
              <h2 className="max-w-4xl whitespace-pre-line text-[clamp(2.1rem,4.2vw,4.95rem)] font-light uppercase leading-[1.02] text-[color:var(--primary)]">
                {data.title}
              </h2>

              <div className="mt-7 max-w-3xl space-y-3 text-[15px] leading-[1.9] text-[#4a4f55] sm:text-[16px]">
                {data.paragraphs.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={index === 0 ? "font-medium text-[#242424]" : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={data.href}
                  className="inline-flex min-h-12 items-center justify-center border border-[color:var(--primary)] px-6 text-xs font-semibold uppercase text-[color:var(--primary)] transition-colors hover:bg-[color:var(--primary)] hover:text-white"
                >
                  {data.cta}
                </Link>
                <Link
                  href={data.secondaryHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#2daee4] px-6 text-xs font-semibold uppercase text-white transition-colors hover:bg-[color:var(--primary)]"
                >
                  <span>{data.secondaryCta}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(15rem,0.86fr)_minmax(0,1fr)] lg:items-center">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8eef3]">
                  <Image
                    src={data.secondaryImage.src}
                    alt={data.secondaryImage.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
                  />
                </div>

                <div className="grid gap-5">
                  {data.features.map((feature, index) => {
                    const Icon = FEATURE_ICONS[index] ?? Warehouse;

                    return (
                      <div key={feature.title} className="grid grid-cols-[3rem_1fr] gap-4">
                        <div className="flex size-12 items-center justify-center text-[#2daee4]">
                          <Icon className="size-8 stroke-[1.7]" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-sans text-[17px] font-semibold leading-snug text-[#1f242a]">
                            {feature.title}
                          </h3>
                          <p className="mt-1 text-[13px] leading-relaxed text-[#5c6670]">
                            {feature.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[24rem] bg-[#d7e4ef] sm:min-h-[30rem] lg:min-h-[42rem]">
            <Image
              src={data.primaryImage.src}
              alt={data.primaryImage.alt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 38vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002b50]/12 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
