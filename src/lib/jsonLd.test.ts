import { expect, test } from "vitest";

import { articleJsonLd } from "./jsonLd";

test("articleJsonLd emits a complete Article with absolute image and page URLs", () => {
  const jsonLd = articleJsonLd({
    headline: "New silica-free surface launch",
    description: "ZYL introduces a safer engineered stone option.",
    image: ["/assets/news/silica-free.jpg", "https://cdn.example.com/news.jpg"],
    datePublished: "2026-04-20T08:00:00.000Z",
    url: "/news/silica-free-launch",
  });

  expect(jsonLd).toMatchObject({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "New silica-free surface launch",
    description: "ZYL introduces a safer engineered stone option.",
    datePublished: "2026-04-20T08:00:00.000Z",
    image: [
      "https://www.zylsinteredstone.com/assets/news/silica-free.jpg",
      "https://cdn.example.com/news.jpg",
    ],
    url: "https://www.zylsinteredstone.com/news/silica-free-launch",
    author: {
      "@type": "Organization",
      name: "ZYL",
    },
    publisher: {
      "@type": "Organization",
      name: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
    },
  });
});
