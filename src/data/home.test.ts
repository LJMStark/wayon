import { expect, test } from "vitest";

import zhMessages from "@/messages/zh.json";

import { getEngineeringCases, getFeaturedProductPoster } from "./home";

type EngineeringCaseTranslator = Parameters<typeof getEngineeringCases>[0];

function translate(key: string): string {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (typeof value !== "object" || value === null) {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, zhMessages) as string;
}

test("home engineering cases keep source image names and Chinese titles aligned", () => {
  expect(getEngineeringCases(translate as EngineeringCaseTranslator)).toEqual([
    {
      title: "威豪酒店",
      image: "/assets/cases/case-1-weihao-hotel.png",
      href: "/assets/cases/case-1-weihao-hotel.png",
    },
    {
      title: "广州粤海置地",
      image: "/assets/cases/case-2-guangzhou-yuehai-land.png",
      href: "/assets/cases/case-2-guangzhou-yuehai-land.png",
    },
    {
      title: "青语花园酒店",
      image: "/assets/cases/case-3-qingyu-garden-hotel.png",
      href: "/assets/cases/case-3-qingyu-garden-hotel.png",
    },
    {
      title: "林城山水酒店",
      image: "/assets/cases/case-4-lincheng-shanshui-hotel.jpg",
      href: "/assets/cases/case-4-lincheng-shanshui-hotel.jpg",
      objectPosition: "top center",
    },
    {
      title: "威豪PARTYK",
      image: "/assets/cases/case-5-weihao-partyk.png",
      href: "/assets/cases/case-5-weihao-partyk.png",
    },
    {
      title: "粤海·云港城",
      image: "/assets/cases/case-6-yuehai-yungang-city.png",
      href: "/assets/cases/case-6-yuehai-yungang-city.png",
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
