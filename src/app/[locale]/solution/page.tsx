"use client";

import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  formatCopy,
  getCommonCopy,
  getSolutionPageCopy,
} from "@/data/siteCopy";
import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "@/features/products/model/productExposure";

const PRIMARY_TABS = [
  "finishedProducts",
  "applicationField",
  "project",
] as const;

const SECONDARY_TABS = ["catalogSeriesTexture", "catalogSeriesFamous", "catalogSeriesTravertine"] as const;

const GALLERY_IMAGES = [
  { src: "/assets/solutions-gallery/gallery-0.jpg", aspect: "aspect-[4/3]" },
  { src: "/assets/solutions-gallery/gallery-1.jpg", aspect: "aspect-[3/4]" },
  { src: "/assets/solutions-gallery/gallery-2.jpg", aspect: "aspect-[16/9]" },
  { src: "/assets/solutions-gallery/gallery-3.jpg", aspect: "aspect-square" },
  { src: "/assets/solutions-gallery/gallery-4.jpg", aspect: "aspect-[3/4]" },
  { src: "/assets/solutions-gallery/gallery-5.jpg", aspect: "aspect-[16/9]" },
  { src: "/assets/solutions-gallery/gallery-6.jpg", aspect: "aspect-[4/5]" },
  { src: "/assets/solutions-gallery/gallery-7.jpg", aspect: "aspect-[16/9]" },
  { src: "/assets/solutions-gallery/gallery-8.jpg", aspect: "aspect-[4/3]" },
  { src: "/assets/solutions-gallery/gallery-9.jpg", aspect: "aspect-square" },
  { src: "/assets/solutions-gallery/gallery-10.jpg", aspect: "aspect-[3/4]" },
  { src: "/assets/solutions-gallery/gallery-11.jpg", aspect: "aspect-[4/5]" },
];

type PrimaryTabKey = (typeof PRIMARY_TABS)[number];
type SecondaryTabKey = (typeof SECONDARY_TABS)[number];
type GalleryImage = {
  src: string;
  aspect: string;
};

function getPrimaryTabButtonClassName(isActive: boolean): string {
  if (isActive) {
    return "border border-[#0f2858] bg-[#0f2858] px-8 py-2.5 text-sm tracking-wide text-white transition-colors";
  }

  return "border border-gray-200 bg-white px-8 py-2.5 text-sm tracking-wide text-gray-600 transition-colors hover:border-gray-400";
}

function getSecondaryTabButtonClassName(isActive: boolean): string {
  if (isActive) {
    return "font-medium uppercase opacity-100 transition-opacity hover:opacity-100";
  }

  return "uppercase opacity-60 transition-opacity hover:opacity-100";
}

function getTabFromHash(hash: string): PrimaryTabKey | null {
  if (hash === "#case") {
    return "project";
  }

  return null;
}

function getImagesForTab(
  activeTab: PrimaryTabKey,
  activeSubTab: SecondaryTabKey
): GalleryImage[] {
  if (activeTab === "finishedProducts") {
    return GALLERY_IMAGES.slice(3).concat(GALLERY_IMAGES.slice(0, 3));
  }


  if (activeTab === "project") {
    return [...GALLERY_IMAGES].reverse();
  }

  if (activeSubTab === "catalogSeriesFamous") {
    return GALLERY_IMAGES.slice(2, 10);
  }

  if (activeSubTab === "catalogSeriesTravertine") {
    return GALLERY_IMAGES.slice(4, 12);
  }

  return GALLERY_IMAGES;
}

export default function SolutionPage(): React.JSX.Element {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const commonCopy = getCommonCopy(locale);
  const solutionCopy = getSolutionPageCopy(locale);
  const [activeTab, setActiveTab] = useState<PrimaryTabKey>("applicationField");
  const [activeSubTab, setActiveSubTab] = useState<SecondaryTabKey>("catalogSeriesTexture");

  useEffect(() => {
    const handleHashChange = (): void => {
      const nextTab = getTabFromHash(window.location.hash);

      if (nextTab) {
        setActiveTab(nextTab);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const masonryImages = getImagesForTab(activeTab, activeSubTab);

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <PageHero
        imageSrc="/assets/hero/hero-2.jpg"
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
        <Link href="/solution" className="hover:text-black">
          {commonCopy.allCases}
        </Link>{" "}
        &gt; <span className="text-black">{tNav(activeTab)}</span>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pb-24">
        <div className="mb-6 flex flex-wrap justify-center gap-2 md:gap-4">
          {PRIMARY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={getPrimaryTabButtonClassName(activeTab === tab)}
            >
              {tNav(tab)}
            </button>
          ))}
        </div>

        {activeTab === "applicationField" ? (
          <div className="mb-16 flex justify-center gap-8 text-[13px] text-[#0f2858]">
            {SECONDARY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSubTab(tab)}
                className={getSecondaryTabButtonClassName(activeSubTab === tab)}
              >
                {tNav(tab)}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-8">
          <h2 className="mb-8 text-2xl font-bold text-[#1a1a1a]">
            {tNav(activeTab)}
          </h2>

          <div className="columns-1 gap-2 md:columns-2 lg:columns-3">
            {masonryImages.map((image, index) => (
              <div
                key={`${image.src}-${index}`}
                className="group relative mb-2 cursor-pointer overflow-hidden break-inside-avoid bg-neutral-100"
              >
                <div className={`relative w-full ${image.aspect}`}>
                  <Image
                    src={image.src}
                    alt={formatCopy(solutionCopy.galleryAlt, { index: index + 1 })}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors duration-500 group-hover:bg-black/10 group-hover:opacity-100">
                    <span className="translate-y-4 transform text-3xl font-normal tracking-[0.2em] text-white transition-all duration-500 group-hover:translate-y-0">
                      ZYL
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
