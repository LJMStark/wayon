"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

import { getCommonCopy, getSolutionPageCopy } from "@/data/siteCopy";

const SOLUTION_SCENES = [
  {
    labelKey: "HomeData.Solutions.item0.label" as const,
    titleKey: "HomeData.Solutions.item0.title" as const,
    descriptionKey: "HomeData.Solutions.item0.description" as const,
    image: "/assets/solutions/scene-kitchen-countertops.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item1.label" as const,
    titleKey: "HomeData.Solutions.item1.title" as const,
    descriptionKey: "HomeData.Solutions.item1.description" as const,
    image: "/assets/solutions/scene-bathroom-spaces.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item2.label" as const,
    titleKey: "HomeData.Solutions.item2.title" as const,
    descriptionKey: "HomeData.Solutions.item2.description" as const,
    image: "/assets/solutions/scene-furniture-tops.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item3.label" as const,
    titleKey: "HomeData.Solutions.item3.title" as const,
    descriptionKey: "HomeData.Solutions.item3.description" as const,
    image: "/assets/solutions/scene-wall-floor.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item4.label" as const,
    titleKey: "HomeData.Solutions.item4.title" as const,
    descriptionKey: "HomeData.Solutions.item4.description" as const,
    image: "/assets/solutions/scene-commercial-showcase.jpg",
  },
] as const;

export default function SolutionPage(): React.JSX.Element {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const t = useTranslations();
  const commonCopy = getCommonCopy(locale);
  const solutionCopy = getSolutionPageCopy(locale);

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <PageHero
        imageSrc="/assets/solutions/scene-kitchen-countertops.jpg"
        imageAlt={solutionCopy.heroTitle}
        title={solutionCopy.heroTitle}
        subtitle={solutionCopy.heroSubtitle}
      />

      <div className="mx-auto mb-8 max-w-[1400px] border-b border-gray-100 px-6 py-4 text-[13px] text-[#555555]">
        <span className="text-[#666666]">◆</span> {commonCopy.breadcrumbLabel}:{" "}
        <Link href="/" className="hover:text-black">
          {tNav("home")}
        </Link>{" "}
        &gt;{" "}
        <span className="text-black">{tNav("solution")}</span>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pb-24">
        <div className="space-y-20">
          {SOLUTION_SCENES.map((scene, index) => {
            const isReversed = index % 2 === 1;

            return (
              <section
                key={scene.labelKey}
                id={`scene-${index}`}
                className="scroll-mt-24"
              >
                <div
                  className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14 ${
                    isReversed ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 lg:w-[58%]">
                    <Image
                      src={scene.image}
                      alt={t(scene.titleKey)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.03]"
                    />
                  </div>

                  <div className="flex flex-col justify-center lg:w-[42%]">
                    <span className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--primary)]/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mb-4 text-[28px] font-medium leading-tight text-[#1a1a1a] md:text-[34px]">
                      {t(scene.titleKey)}
                    </h2>
                    <p className="mb-6 text-[15px] leading-[1.8] text-[#555]">
                      {t(scene.descriptionKey)}
                    </p>
                    <Link
                      href="/contact"
                      className="group inline-flex items-center gap-2 text-[14px] font-medium tracking-wide text-[color:var(--primary)] transition-colors hover:text-[color:var(--primary)]/80"
                    >
                      {commonCopy.contactUs}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-24 border-t border-gray-100 pt-12 text-center">
          <h3 className="mb-4 text-2xl font-medium text-[#1a1a1a]">
            {commonCopy.contactUs}
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed text-[#666]">
            {solutionCopy.heroSubtitle}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#0f2858] bg-[#0f2858] px-10 py-3 text-sm tracking-wide text-white transition-colors hover:bg-[#1a3a7a]"
          >
            {commonCopy.contactUs}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
