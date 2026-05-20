import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { expect, test } from "vitest";

import type { AppLocale } from "@/i18n/types";
import {
  getLocalizedNewsBody,
  getLocalizedNewsValue,
  type NewsArticleBody,
  type NewsArticle,
} from "@/data/news";

import {
  buildNewsDetailPageData,
  getNewsPreviewImage,
  resolveNewsVisualText,
  toNewsPreviewItem,
} from "./news-view";

const LOCALES: Record<AppLocale, string> = {
  en: "News title",
  zh: "新闻标题",
  es: "Titulo de noticia",
  ar: "عنوان الخبر",
};

const NEWS_SLUGS = [
  "zyl-918-global-opening",
  "what-is-sintered-stone",
  "sintered-stone-vs-quartz-vs-marble",
  "sintered-slab-thickness-guide",
  "sourcing-sintered-slabs-from-china",
  "sintered-slab-architectural-applications",
  "seo-luxury-sintered-stone-vs-tile",
  "seo-sintered-stone-marble-replication",
  "seo-wall-floor-application-sintered-stone",
  "seo-fireproof-sintered-stone-grade",
  "seo-marble-too-expensive-sintered-stone",
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
      imageUrl: "/assets/cases/case-2-guangzhou-yuehai-land.webp",
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

test("unknown news previews use the news fallback when no CMS cover exists", () => {
  const item = toNewsPreviewItem(makeArticle("custom-company-update"), "zh");

  expect(item?.image).toBe("/assets/fallbacks/news-fallback.jpg");
});

test("home news entries can reuse the same subject-matched preview image", () => {
  const image = getNewsPreviewImage(
    {
      ...makeArticle("sintered-slab-architectural-applications"),
      imageUrl: "https://example.com/city-night.jpg",
    },
    "zh"
  );

  expect(image).toBe("/assets/solutions/scene-commercial-showcase.jpg");
});

test("latest SEO news previews use article-matched visuals instead of generic showroom covers", () => {
  const previews = [
    {
      slug: "seo-luxury-sintered-stone-vs-tile",
      imageUrl: "https://example.com/showroom-001.jpg",
      expected: "/assets/solutions/furniture-tops.webp",
    },
    {
      slug: "seo-sintered-stone-marble-replication",
      imageUrl: "https://example.com/showroom-005.jpg",
      expected: "/assets/solutions/scene-bathroom-spaces.jpg",
    },
    {
      slug: "seo-wall-floor-application-sintered-stone",
      imageUrl: "https://example.com/case-sales-006.jpg",
      expected: "/assets/solutions/scene-wall-floor.jpg",
    },
    {
      slug: "seo-fireproof-sintered-stone-grade",
      imageUrl: "https://example.com/showroom-008.jpg",
      expected: "/assets/cases/case-5-weihao-partyk.webp",
    },
    {
      slug: "seo-marble-too-expensive-sintered-stone",
      imageUrl: "https://example.com/case-sales-002.jpg",
      expected: "/assets/solutions/kitchen-countertops.webp",
    },
  ] as const;

  for (const { slug, imageUrl, expected } of previews) {
    const item = toNewsPreviewItem(
      {
        ...makeArticle(slug),
        imageUrl,
      },
      "zh"
    );

    expect(item?.image, slug).toBe(expected);
  }
});

test("latest SEO news detail pages use the matched article visual as hero", () => {
  const image = buildNewsDetailPageData(
    {
      ...makeArticle("seo-marble-too-expensive-sintered-stone"),
      imageUrl: "https://example.com/case-sales-002.jpg",
    },
    "zh",
    {
      backToNewsLabel: "返回新闻",
      contactCtaTitle: "需要报价或样品支持？",
      contactLabel: "联系我们",
      contentComingSoonLabel: "内容即将上线",
    }
  ).imageUrl;

  expect(image).toBe("/assets/solutions/kitchen-countertops.webp");
});

test("subject-matched news preview heroes stay unique across evergreen and latest SEO news", () => {
  const slugs = NEWS_SLUGS.filter((slug) => slug !== "zyl-918-global-opening");
  const images: string[] = [];

  for (const slug of slugs) {
    const image = getNewsPreviewImage(
      {
        ...makeArticle(slug),
        imageUrl: `https://example.com/${slug}.jpg`,
      },
      "zh"
    );

    expect(image, slug).toBeTruthy();
    images.push(image as string);
  }

  expect(new Set(images).size).toBe(images.length);
});

test("news detail page uses the matched primary visual as hero without duplicating it", () => {
  const data = buildNewsDetailPageData(
    {
      ...makeArticle("sintered-slab-architectural-applications"),
      imageUrl: "/assets/cases/case-2-guangzhou-yuehai-land.webp",
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

test("zyl 918 opening article keeps the cover plus all imported body images", () => {
  const data = buildNewsDetailPageData(makeArticle("zyl-918-global-opening"), "zh", {
    backToNewsLabel: "返回新闻",
    contactCtaTitle: "需要报价或样品支持？",
    contactLabel: "联系我们",
    contentComingSoonLabel: "内容即将上线",
  });

  expect(data.imageUrl).toBe(
    "/assets/news/zyl-918-global-opening/00-cover.jpg"
  );
  expect(data.visuals).toHaveLength(19);
  expect(data.visuals.at(-1)?.src).toBe(
    "/assets/news/zyl-918-global-opening/19.jpg"
  );
});

test("zyl 918 opening visuals do not expose Chinese captions outside zh", () => {
  const data = buildNewsDetailPageData(makeArticle("zyl-918-global-opening"), "en", {
    backToNewsLabel: "Back to News",
    contactCtaTitle: "Need pricing or sample support?",
    contactLabel: "Contact Us",
    contentComingSoonLabel: "Content coming soon.",
  });

  for (const visual of data.visuals) {
    expect(`${visual.alt} ${visual.caption}`).not.toMatch(/[\u3400-\u9fff]/);
  }
});

test("news visual text rejects Chinese stored in non-Chinese locale fields", () => {
  const value = {
    en: "众岩联全球馆开业现场",
    zh: "众岩联全球馆开业现场",
    es: "众岩联全球馆开业现场",
    ar: "众岩联全球馆开业现场",
  };

  expect(resolveNewsVisualText(value, "en")).toBe("");
  expect(resolveNewsVisualText(value, "es")).toBe("");
  expect(resolveNewsVisualText(value, "ar")).toBe("");
  expect(resolveNewsVisualText(value, "zh")).toBe("众岩联全球馆开业现场");
});

test("news visual text uses English instead of Chinese fallback outside zh", () => {
  const value = {
    en: "Opening ceremony scene",
    zh: "开业盛典现场",
    es: "",
    ar: "",
  };

  expect(resolveNewsVisualText(value, "es")).toBe("Opening ceremony scene");
  expect(resolveNewsVisualText(value, "ar")).toBe("Opening ceremony scene");
});

test("news value helpers do not fall back to Chinese outside zh", () => {
  const zhBody = {
    root: {
      type: "root",
      children: [],
      direction: null,
      format: "",
      indent: 0,
      version: 1,
    },
  } as unknown as NewsArticleBody;
  const article = {
    ...makeArticle("zh-only-news"),
    title: {
      en: "",
      zh: "中文新闻标题",
      es: "",
      ar: "",
    },
    excerpt: {
      en: "",
      zh: "中文新闻摘要",
      es: "",
      ar: "",
    },
    body: {
      zh: zhBody,
    },
  } satisfies NewsArticle;

  expect(getLocalizedNewsValue(article, "en", "title")).toBe("");
  expect(getLocalizedNewsValue(article, "en", "excerpt")).toBe("");
  expect(getLocalizedNewsBody(article, "en")).toBeNull();
  expect(getLocalizedNewsValue(article, "zh", "title")).toBe("中文新闻标题");
  expect(getLocalizedNewsBody(article, "zh")).not.toBeNull();
});

test("news value helpers reject Chinese text stored in non-Chinese locale fields", () => {
  const chineseBody = {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "中文新闻正文",
            },
          ],
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      version: 1,
    },
  } as unknown as NewsArticleBody;
  const article = {
    ...makeArticle("mislocalized-news"),
    title: {
      en: "众岩联全球馆盛大启幕",
      zh: "众岩联全球馆盛大启幕",
      es: "众岩联全球馆盛大启幕",
      ar: "众岩联全球馆盛大启幕",
    },
    excerpt: {
      en: "广东众岩联岩板科技有限公司全球馆开业盛典在佛山举行",
      zh: "广东众岩联岩板科技有限公司全球馆开业盛典在佛山举行",
      es: "广东众岩联岩板科技有限公司全球馆开业盛典在佛山举行",
      ar: "广东众岩联岩板科技有限公司全球馆开业盛典在佛山举行",
    },
    body: {
      en: chineseBody,
      zh: chineseBody,
      es: chineseBody,
      ar: chineseBody,
    },
  } satisfies NewsArticle;

  expect(getLocalizedNewsValue(article, "en", "title")).toBe("");
  expect(getLocalizedNewsValue(article, "es", "excerpt")).toBe("");
  expect(getLocalizedNewsBody(article, "en")).toBeNull();
  expect(toNewsPreviewItem(article, "en")).toBeNull();
  expect(getLocalizedNewsValue(article, "zh", "title")).toBe(
    "众岩联全球馆盛大启幕"
  );
  expect(getLocalizedNewsBody(article, "zh")).not.toBeNull();
});

function makeArticle(slug: string): NewsArticle {
  return {
    _id: slug,
    title: LOCALES,
    slug,
    publishedAt: "2026-04-10T09:30:00.000Z",
    updatedAt: "2026-04-10T09:30:00.000Z",
    imageUrl: "",
    excerpt: LOCALES,
    category: "industry",
  };
}
