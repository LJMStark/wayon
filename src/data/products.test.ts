import { expect, test } from "vitest";

import type { AppLocale } from "@/i18n/types";

import { getProductDisplayTitle, type Product } from "./products.ts";

function makeProduct(title: Record<AppLocale, string>): Product {
  return {
    _id: "p1",
    slug: "royal-jade-white",
    title,
    published: true,
    seriesTypes: [],
    variants: [],
  };
}

test("getProductDisplayTitle keeps Chinese titles on zh and converts Chinese titles to uppercase pinyin elsewhere", () => {
  const product = makeProduct({
    en: "Royal Jade White",
    zh: "皇家鱼肚白",
    es: "Blanco Jade Real",
    ar: "أبيض اليشم الملكي",
  });

  expect(getProductDisplayTitle(product, "zh")).toBe("皇家鱼肚白");
  expect(getProductDisplayTitle(product, "en")).toBe("HUANG JIA YU DU BAI");
  expect(getProductDisplayTitle(product, "es")).toBe("HUANG JIA YU DU BAI");
  expect(getProductDisplayTitle(product, "ar")).toBe("HUANG JIA YU DU BAI");
});
