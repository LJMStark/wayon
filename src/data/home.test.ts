import { expect, test } from "vitest";

import zhMessages from "@/messages/zh.json";

import {
  HERO_SLIDES,
  getAboutAlbum,
  getEngineeringCases,
  getFeaturedProductPoster,
  getHeroSlides,
  getSolutions,
} from "./home";

type EngineeringCaseTranslator = Parameters<typeof getEngineeringCases>[0];

function translate(key: string): string {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (typeof value !== "object" || value === null) {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, zhMessages) as string;
}

test("home engineering cases keep source image names and route to /cases", () => {
  expect(getEngineeringCases(translate as EngineeringCaseTranslator)).toEqual([
    {
      title: "威豪酒店",
      image: "/assets/cases/case-1-weihao-hotel.webp",
      href: "/cases",
    },
    {
      title: "广州粤海置地",
      image: "/assets/cases/case-2-guangzhou-yuehai-land.webp",
      href: "/cases",
    },
    {
      title: "青语花园酒店",
      image: "/assets/cases/case-3-qingyu-garden-hotel.webp",
      href: "/cases",
    },
    {
      title: "林城山水酒店",
      image: "/assets/cases/case-4-lincheng-shanshui-hotel.jpg",
      href: "/cases",
      objectPosition: "top center",
    },
    {
      title: "威豪PARTYK",
      image: "/assets/cases/case-5-weihao-partyk.webp",
      href: "/cases",
    },
    {
      title: "粤海·云港城",
      image: "/assets/cases/case-6-yuehai-yungang-city.webp",
      href: "/cases",
      objectPosition: "left bottom",
    },
  ]);
});

test("featured product poster points to the positioned crystal process listing", () => {
  expect(getFeaturedProductPoster(translate as EngineeringCaseTranslator)).toMatchObject({
    eyebrow: "主推新品",
    image: "/assets/home-products/featured-positioned-crystal-glaze.jpg",
    href: "/products?section=process&value=%E5%AE%9A%E4%BD%8D%E5%BD%A9%E6%99%B6",
  });
});

test("home solution wall-floor item uses the lobby image", () => {
  const solutions = getSolutions(translate as EngineeringCaseTranslator);

  expect(solutions[3]).toMatchObject({
    title: "墙地一体建筑方案",
    image: "/assets/hero/home-hero-lobby.jpg",
  });
});

test("home videos use versioned responsive CDN sources", () => {
  expect(HERO_SLIDES[0]).toMatchObject({
    type: "video",
    poster: "/assets/about/zyl-global-pavilion.webp",
    src: expect.stringContaining(
      "/home-about-pavilion-entrance-720p-v20260508.mp4"
    ),
    sources: [
      expect.objectContaining({
        src: expect.stringContaining(
          "/home-about-pavilion-entrance-1080p-v20260508.mp4"
        ),
        media: "(min-width: 1024px)",
        type: "video/mp4",
      }),
      expect.objectContaining({
        src: expect.stringContaining(
          "/home-about-pavilion-entrance-720p-v20260508.mp4"
        ),
        type: "video/mp4",
      }),
    ],
  });

  const aboutAlbum = getAboutAlbum(translate as EngineeringCaseTranslator);

  expect(aboutAlbum[0]?.videoSources).toEqual([
    expect.objectContaining({
      src: expect.stringContaining("/home-about-warehouse-1080p-v20260508.mp4"),
      media: "(min-width: 1024px)",
    }),
    expect.objectContaining({
      src: expect.stringContaining("/home-about-warehouse-720p-v20260508.mp4"),
    }),
  ]);
});

test("home hero slide alt text is localized by page language", () => {
  const enTranslate = ((key: string) =>
    key === "HomeData.AboutAlbum.item0.title"
      ? "ZYL Sintered Stone / Guangdong ZYL Sintered Stone"
      : translate(key)) as EngineeringCaseTranslator;

  expect(getHeroSlides(translate as EngineeringCaseTranslator)[0]?.alt).toBe(
    "众岩联全球馆"
  );
  expect(getHeroSlides(enTranslate)[0]?.alt).toBe(
    "ZYL Sintered Stone / Guangdong ZYL Sintered Stone"
  );
  expect(getHeroSlides(enTranslate)[0]?.alt).not.toMatch(/[\u3400-\u9fff]/);
});
