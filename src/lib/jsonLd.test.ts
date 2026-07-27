import { expect, test } from "vitest";

import {
  articleJsonLd,
  newsBreadcrumbJsonLd,
  productsListBreadcrumbJsonLd,
} from "./jsonLd";

test("Chinese breadcrumb URLs keep the required /zh prefix", () => {
  expect(productsListBreadcrumbJsonLd("zh")).toMatchObject({
    itemListElement: [
      {
        position: 1,
        item: "https://zylsinteredstone.com/zh",
      },
      {
        position: 2,
        item: "https://zylsinteredstone.com/zh/products",
      },
    ],
  });
});

test("localized detail breadcrumbs use direct locale-prefixed URLs", () => {
  expect(
    newsBreadcrumbJsonLd("en", "Launch", "/en/news/launch"),
  ).toMatchObject({
    itemListElement: [
      {
        position: 1,
        item: "https://zylsinteredstone.com/en",
      },
      {
        position: 2,
        item: "https://zylsinteredstone.com/en/news",
      },
      {
        position: 3,
        item: "https://zylsinteredstone.com/en/news/launch",
      },
    ],
  });
});

test("articleJsonLd emits a complete Article with absolute image and page URLs", () => {
  const jsonLd = articleJsonLd({
    headline: "New silica-free surface launch",
    description: "ZYL Sintered Stone introduces a safer engineered stone option.",
    image: ["/assets/news/news-feature.jpg", "https://cdn.example.com/news.jpg"],
    datePublished: "2026-04-20T08:00:00.000Z",
    url: "/news/silica-free-launch",
  });

  expect(jsonLd).toMatchObject({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "New silica-free surface launch",
    description: "ZYL Sintered Stone introduces a safer engineered stone option.",
    datePublished: "2026-04-20T08:00:00.000Z",
    image: [
      "https://zylsinteredstone.com/assets/news/news-feature.jpg",
      "https://cdn.example.com/news.jpg",
    ],
    url: "https://zylsinteredstone.com/news/silica-free-launch",
    author: {
      "@type": "Organization",
      name: "ZYL Sintered Stone",
    },
    publisher: {
      "@type": "Organization",
      name: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
    },
  });
});
