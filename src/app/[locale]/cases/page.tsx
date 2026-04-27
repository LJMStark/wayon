"use client";

import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  formatCopy,
  getCommonCopy,
  getCasesPageCopy,
} from "@/data/siteCopy";

const PRIMARY_TAB_KEYS = ["salesCooperation", "factoryCooperation"] as const;

type PrimaryTabKey = (typeof PRIMARY_TAB_KEYS)[number];
type GalleryImage = {
  src: string;
  aspect: string;
};

const GALLERY_IMAGES: GalleryImage[] = [
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

const FACTORY_IMAGES: GalleryImage[] = Array.from({ length: 32 }, (_, i) => ({
  src: `/assets/factory-cooperation/case-${i + 1}.jpg`,
  aspect: "aspect-[8/5]",
}));

function getPrimaryTabButtonClassName(isActive: boolean): string {
  if (isActive) {
    return "border border-[#0f2858] bg-[#0f2858] px-8 py-2.5 text-sm tracking-wide text-white transition-colors";
  }

  return "border border-gray-200 bg-white px-8 py-2.5 text-sm tracking-wide text-gray-600 transition-colors hover:border-gray-400";
}

function getTabFromHash(hash: string): PrimaryTabKey | null {
  if (hash === "#factory") {
    return "factoryCooperation";
  }

  return null;
}

export default function CasesPage(): React.JSX.Element {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const commonCopy = getCommonCopy(locale);
  const casesCopy = getCasesPageCopy(locale);
  const [activeTab, setActiveTab] = useState<PrimaryTabKey>("salesCooperation");

  const getImageLabel = (index: number): string => {
    const names =
      activeTab === "factoryCooperation"
        ? casesCopy.factoryCaseNames
        : casesCopy.salesCaseNames;

    return names[index] ?? "";
  };

  const getPrimaryTabLabel = (tabKey: PrimaryTabKey): string => tNav(tabKey);

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

  const masonryImages: GalleryImage[] =
    activeTab === "factoryCooperation" ? FACTORY_IMAGES : GALLERY_IMAGES;

  return (
    <main className="min-h-screen wayon-stone-bg text-[#1a1a1a]">
      <PageHero
        imageSrc="/assets/hero/hero-2.jpg"
        imageAlt={casesCopy.heroTitle}
        title={casesCopy.heroTitle}
        subtitle={casesCopy.heroSubtitle}
      />

      <div className="mx-auto mb-8 max-w-[1400px] border-b border-gray-100 px-6 py-4 text-[13px] text-[#555555]">
        <span className="text-[#666666]">◆</span> {commonCopy.breadcrumbLabel}:{" "}
        <Link href="/" className="hover:text-black">
          {tNav("home")}
        </Link>{" "}
        &gt;{" "}
        <Link href="/cases" className="hover:text-black">
          {commonCopy.allCases}
        </Link>{" "}
        &gt; <span className="text-black">{getPrimaryTabLabel(activeTab)}</span>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pb-24">
        <div className="mb-6 flex flex-wrap justify-center gap-2 md:gap-4">
          {PRIMARY_TAB_KEYS.map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={getPrimaryTabButtonClassName(activeTab === tabKey)}
            >
              {tNav(tabKey)}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-8 text-2xl font-bold text-[#1a1a1a]">
            {getPrimaryTabLabel(activeTab)}
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
                    alt={formatCopy(casesCopy.galleryAlt, { index: index + 1 })}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors duration-500 group-hover:bg-black/20 group-hover:opacity-100">
                    <span className="translate-y-4 transform px-4 text-center text-xl font-normal tracking-[0.1em] text-white transition-all duration-500 group-hover:translate-y-0">
                      {getImageLabel(index)}
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
