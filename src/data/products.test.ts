import { expect, test } from "vitest";

import type { AppLocale } from "@/i18n/types";

import {
  getLocalizedProductValue,
  getProductDisplayTitle,
  type Product,
} from "./products.ts";

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

test("getProductDisplayTitle strips leading product codes from localized titles", () => {
  const product = makeProduct({
    en: "WG639 Flowsilk White",
    zh: "ZYL1632L971雅诗兰黛",
    es: "WG639 Blanco Seda Flujo",
    ar: "WG639 أبيض حرير متدفق",
  });

  expect(getProductDisplayTitle(product, "zh")).toBe("雅诗兰黛");
  expect(getProductDisplayTitle(product, "en")).toBe("YA SHI LAN DAI");
  expect(getProductDisplayTitle(product, "es")).toBe("YA SHI LAN DAI");
});

test("getProductDisplayTitle transliterates Chinese titles when no non-Chinese title is available", () => {
  const product = makeProduct({
    en: "",
    zh: "皇家鱼肚白",
    es: "",
    ar: "",
  });

  expect(getProductDisplayTitle(product, "en")).toBe("HUANG JIA YU DU BAI");
});

test("getProductDisplayTitle falls back to non-Chinese localized title when Chinese title is missing", () => {
  const product = makeProduct({
    en: "Estee Stone",
    zh: "",
    es: "Piedra Estee",
    ar: "حجر إيستي",
  });

  expect(getProductDisplayTitle(product, "en")).toBe("Estee Stone");
  expect(getProductDisplayTitle(product, "es")).toBe("Piedra Estee");
  expect(getProductDisplayTitle(product, "ar")).toBe("حجر إيستي");
});

test("getLocalizedProductValue does not return Chinese descriptions outside zh", () => {
  const product: Product = {
    ...makeProduct({
      en: "",
      zh: "雅诗兰黛",
      es: "",
      ar: "",
    }),
    description: {
      en: "",
      zh: "中文产品描述",
      es: "",
      ar: "",
    },
  };

  expect(getLocalizedProductValue(product, "en", "title")).toBe("YA SHI LAN DAI");
  expect(getLocalizedProductValue(product, "en", "description")).toBe("");
  expect(getLocalizedProductValue(product, "zh", "description")).toBe(
    "中文产品描述"
  );
});
