import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { expect, test } from "vitest";

import type { AppLocale } from "@/i18n/types";
import type { NewsArticle } from "@/data/news";

import { buildNewsDetailPageData, toNewsPreviewItem } from "./news-view";

const LOCALES: Record<AppLocale, string> = {
  en: "News title",
  zh: "新闻标题",
  es: "Titulo de noticia",
  ar: "عنوان الخبر",
};

const NEWS_SLUGS = [
  "what-is-sintered-stone",
  "sintered-stone-vs-quartz-vs-marble",
  "sintered-slab-thickness-guide",
  "sourcing-sintered-slabs-from-china",
  "sintered-slab-architectural-applications",
] as const;

test("news article visuals use real local assets instead of yellow placeholders", async () => {
  for (const slug of NEWS_SLUGS) {
    const article = makeArticle(slug);
    const data = buildNewsDetailPageData(article, "zh", {
      backToNewsLabel: "返回新闻",
      contactCtaTitle: "需要报价或样品支持？",
      contactLabel: "联系我们",
      contentComingSoonLabel: "内容即将上线",
    });

    const checks = await Promise.all(
      data.visuals.map(async (visual) => {
        const filePath = path.join(process.cwd(), "public", visual.src);
        expect(fs.existsSync(filePath), visual.src).toBe(true);

        const stats = await sharp(filePath).resize(16, 16).stats();
        const [red, green, blue] = stats.channels
          .slice(0, 3)
          .map((channel) => channel.mean);

        return !(red > 200 && green > 150 && blue < 90);
      })
    );

    expect(checks.every(Boolean), slug).toBe(true);
  }
});

test("news previews prefer subject-matched article visuals over CMS cover images", () => {
  const item = toNewsPreviewItem(
    {
      ...makeArticle("sintered-slab-architectural-applications"),
      imageUrl: "/assets/cases/case-2-beijing-children-palace.png",
    },
    "zh"
  );

  expect(item?.image).toBe("/assets/solutions/scene-commercial-showcase.jpg");
});

test("unknown news previews keep their CMS cover image", () => {
  const item = toNewsPreviewItem(
    {
      ...makeArticle("custom-company-update"),
      imageUrl: "/assets/news/news-feature.jpg",
    },
    "zh"
  );

  expect(item?.image).toBe("/assets/news/news-feature.jpg");
});

test("news detail page uses the matched primary visual as hero without duplicating it", () => {
  const data = buildNewsDetailPageData(
    {
      ...makeArticle("sintered-slab-architectural-applications"),
      imageUrl: "/assets/cases/case-2-beijing-children-palace.png",
    },
    "zh",
    {
      backToNewsLabel: "返回新闻",
      contactCtaTitle: "需要报价或样品支持？",
      contactLabel: "联系我们",
      contentComingSoonLabel: "内容即将上线",
    }
  );

  expect(data.imageUrl).toBe("/assets/solutions/scene-commercial-showcase.jpg");
  expect(data.visuals.map((visual) => visual.src)).not.toContain(data.imageUrl);
});

function makeArticle(slug: string): NewsArticle {
  return {
    _id: slug,
    title: LOCALES,
    slug,
    publishedAt: "2026-04-10T09:30:00.000Z",
    imageUrl: "",
    excerpt: LOCALES,
    category: "industry",
  };
}
