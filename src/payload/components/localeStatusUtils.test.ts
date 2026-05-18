import { expect, test } from "vitest";

import { computeLocaleStatus, localesMissing } from "./localeStatusUtils";

test("product title status treats Chinese title as complete for pinyin locales", () => {
  const status = computeLocaleStatus(
    {
      title: {
        zh: "LV826Y053JD 意大利灰洞",
        en: "",
        es: "",
        ar: "",
      },
    },
    "products"
  );

  expect(status).toEqual({ zh: true, en: true, es: true, ar: true });
  expect(
    localesMissing(
      {
        title: {
          zh: "LV826Y053JD 意大利灰洞",
          en: "",
          es: "",
          ar: "",
        },
      },
      "products"
    )
  ).toEqual([]);
});

test("product title status still rejects Chinese copied into non-Chinese fallback fields", () => {
  const status = computeLocaleStatus(
    {
      title: {
        zh: "",
        en: "皇家鱼肚白",
        es: "皇家鱼肚白",
        ar: "皇家鱼肚白",
      },
    },
    "products"
  );

  expect(status).toEqual({ zh: false, en: false, es: false, ar: false });
});

test("news status still requires each locale title and body", () => {
  const status = computeLocaleStatus(
    {
      title: {
        zh: "新闻标题",
        en: "News title",
        es: "",
        ar: "",
      },
      body: {
        zh: { root: { children: [{ children: [{ text: "正文" }] }] } },
        en: { root: { children: [{ children: [{ text: "Body" }] }] } },
        es: { root: { children: [] } },
        ar: { root: { children: [] } },
      },
    },
    "news"
  );

  expect(status).toEqual({ zh: true, en: true, es: false, ar: false });
});
