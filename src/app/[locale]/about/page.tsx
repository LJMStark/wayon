"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/layout/PageHero";
import { useState } from "react";
import { MoveRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { getAboutPageCopy, getCommonCopy } from "@/data/siteCopy";
import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "@/features/products/model/productExposure";
import { CountUpStat } from "@/components/ui/CountUpStat";

type AboutStat = {
  value: string;
  suffix: string;
  label: string;
};

type DevelopmentHistoryItem = {
  year: string;
  text: string;
};

const EXHIBITION_PLACEHOLDERS = [1, 2, 3, 4] as const;

function getPhilosophyTabClassName(isActive: boolean): string {
  if (isActive) {
    return "border-t-2 border-white bg-[#0b1630] px-12 py-5 text-sm uppercase tracking-wider transition-colors";
  }

  return "px-12 py-5 text-sm uppercase tracking-wider transition-colors hover:bg-white/5";
}

function getExhibitionTabClassName(isActive: boolean): string {
  if (isActive) {
    return "border-b-2 border-black px-10 py-4 text-sm font-medium tracking-wide text-[#1a1a1a] transition-colors";
  }

  return "px-10 py-4 text-sm tracking-wide text-gray-500 transition-colors hover:text-black";
}

function getTimelineRowClassName(isReverse: boolean): string {
  if (isReverse) {
    return "relative mb-24 w-full items-center justify-between md:flex md:flex-row-reverse";
  }

  return "relative mb-24 w-full items-center justify-between md:flex md:flex-row";
}

function getTimelineContentClassName(isReverse: boolean): string {
  if (isReverse) {
    return "ml-8 flex flex-col md:ml-0 md:w-[45%] md:items-start md:text-left";
  }

  return "ml-8 flex flex-col md:ml-0 md:w-[45%] md:items-end md:text-right";
}

export default function AboutPage(): React.JSX.Element {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const commonCopy = getCommonCopy(locale);
  const aboutCopy = getAboutPageCopy(locale);
  const [activePhilosophyTab, setActivePhilosophyTab] = useState<string>(
    aboutCopy.philosophyTabs[0]
  );
  const [activeExhibitionTab, setActiveExhibitionTab] = useState<string>(
    aboutCopy.exhibitionTabs[0]
  );

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <PageHero
        imageSrc={TRADE_YELLOW_PLACEHOLDER_IMAGE}
        imageAlt={aboutCopy.heroTitle}
        title={aboutCopy.heroTitle}
      />

      <div className="mx-auto max-w-7xl border-b border-gray-100 px-6 py-4 text-sm text-gray-500">
        <span className="text-gray-400">◆</span> {commonCopy.breadcrumbLabel}:{" "}
        <Link href="/" className="hover:text-black">
          {tNav("home")}
        </Link>{" "}
        &gt; <span className="text-black">{aboutCopy.breadcrumbCurrent}</span>
      </div>

      <section
        id="who-are-we"
        className="mx-auto max-w-5xl px-6 py-20 text-center"
      >
        <h2 className="mb-4 text-3xl font-light md:text-4xl">
          {aboutCopy.introTitle}
        </h2>
        <h3 className="mb-10 text-sm font-semibold tracking-wider">
          {aboutCopy.introSubtitle}
        </h3>

        <div className="mx-auto max-w-4xl space-y-6 text-left text-[15px] leading-relaxed text-gray-600 md:text-center">
          {aboutCopy.paragraphs.map((paragraph: string) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-2 gap-12 divide-x divide-gray-100 text-center md:grid-cols-4">
          {aboutCopy.stats.map((stat: AboutStat) => (
            <CountUpStat
              key={`${stat.value}-${stat.label}`}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </section>

      <section id="factory" className="mx-auto mb-24 hidden max-w-7xl px-6 md:block">
        <div className="grid h-[400px] grid-cols-2">
          <div className="relative h-full w-full bg-neutral-100">
            <Image
              src={TRADE_YELLOW_PLACEHOLDER_IMAGE}
              alt={aboutCopy.whyTitle}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-[#6b6c6e] p-16 text-white">
            <h2 className="mb-6 text-3xl font-light">{aboutCopy.whyTitle}</h2>
            <p className="mb-10 w-[80%] text-[15px] leading-relaxed text-gray-200">
              {aboutCopy.whyDescription}
            </p>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-sm tracking-wider transition-opacity hover:opacity-80"
            >
              {aboutCopy.whyCta} <MoveRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mb-24 w-full overflow-hidden bg-[#122245] pb-0 pt-24 text-white">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-8 text-4xl font-light tracking-wide">
              {aboutCopy.philosophyTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-300">
              {aboutCopy.philosophyDescription}
            </p>
          </div>

          <div className="flex justify-center border-b border-white/20">
            {aboutCopy.philosophyTabs.map((tab: string) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActivePhilosophyTab(tab)}
                className={getPhilosophyTabClassName(activePhilosophyTab === tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="certificate" className="mx-auto mb-24 max-w-7xl px-6">
        <div className="mb-24 grid items-center gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-light uppercase tracking-widest">
              {aboutCopy.certificatesTitle}
            </h2>
            <p className="mb-8 text-[15px] leading-relaxed text-gray-600">
              {aboutCopy.certificatesDescription}
            </p>
            <Link
              href="/about#certificate"
              className="flex items-center gap-2 border-b border-black pb-1 text-sm uppercase tracking-widest transition-colors hover:text-gray-500"
            >
              {aboutCopy.certificatesCta} <MoveRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative flex h-[300px] items-center justify-center bg-neutral-100">
            <span className="text-sm text-gray-400">
              {aboutCopy.certificatesPlaceholder}
            </span>
          </div>
        </div>

        <div className="grid items-center gap-16 md:grid-cols-2">
          <div className="order-2 flex h-[300px] items-center justify-center bg-neutral-100 md:order-1">
            <span className="text-sm text-gray-400">{aboutCopy.teamPlaceholder}</span>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="mb-6 text-3xl font-light uppercase tracking-widest">
              {aboutCopy.teamTitle}
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-600">
              {aboutCopy.teamDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-32 max-w-7xl px-6 text-center">
        <h2 className="mb-6 text-3xl font-light uppercase tracking-[0.1em]">
          {aboutCopy.exhibitionTitle}
        </h2>
        <p className="mx-auto mb-16 max-w-4xl text-[15px] leading-relaxed text-gray-600">
          {aboutCopy.exhibitionDescription}
        </p>

        <div className="mb-12 flex justify-center border-b border-gray-200">
          {aboutCopy.exhibitionTabs.map((tab: string) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveExhibitionTab(tab)}
              className={getExhibitionTabClassName(activeExhibitionTab === tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {EXHIBITION_PLACEHOLDERS.map((placeholderIndex) => (
            <div key={placeholderIndex} className="flex flex-col">
              <div className="mb-4 flex aspect-[4/3] items-center justify-center bg-neutral-100 text-gray-300">
                a{placeholderIndex}
              </div>
              <p className="text-sm text-gray-500">
                {aboutCopy.exhibitionCardCaption}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full bg-[#fcfcfc] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-24 text-center">
            <h2 className="mr-4 inline-block text-4xl font-light uppercase tracking-widest text-gray-300">
              {aboutCopy.developmentTitleLead}
            </h2>
            <h2 className="inline-block text-4xl font-bold uppercase tracking-widest text-[#0f2858]">
              {aboutCopy.developmentTitleStrong}
            </h2>
          </div>

          <div className="relative border-l md:w-full md:border-l md:border-gray-200">
            <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 transform bg-gray-200 md:block" />

            {aboutCopy.developmentHistory.map(
              (item: DevelopmentHistoryItem, index: number) => {
                const isReverse = index % 2 === 0;

                return (
              <div
                key={item.year}
                className={getTimelineRowClassName(isReverse)}
              >
                <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 transform rounded-full border-[3px] border-white bg-gray-300 shadow-sm md:flex" />

                <div className={getTimelineContentClassName(isReverse)}>
                  <h3 className="mb-4 text-3xl font-bold text-[#0f2858]">
                    {item.year}
                  </h3>
                  <p className="max-w-sm text-sm leading-relaxed text-gray-500">
                    {item.text}
                  </p>
                </div>

                <div className="ml-8 mt-6 flex aspect-video items-center justify-center bg-neutral-100 text-gray-300 md:ml-0 md:mt-0 md:w-[45%]">
                  {item.year}
                </div>
              </div>
                );
              }
            )}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              className="bg-[#0f2858] px-10 py-3 text-sm tracking-wider text-white transition-colors hover:bg-black"
              type="button"
            >
              {aboutCopy.moreButton} →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
