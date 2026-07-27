import { Children, isValidElement } from "react";
import { expect, test, vi } from "vitest";

const getNewsDetailPageData = vi.fn();
const getNewsAvailableLocales = vi.fn();

vi.mock("@/i18n/routing", () => ({
  routing: {
    defaultLocale: "zh",
    locales: ["en", "zh", "es", "ar"],
  },
}));

vi.mock("@/features/news/server/getNewsDetailPageData", () => ({
  getNewsAvailableLocales,
  getNewsDetailPageData,
}));

vi.mock("@/features/news/components/NewsDetailPageView", () => ({
  NewsDetailPageView: () => null,
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
}));

test("news article JSON-LD URL uses the active locale path", async () => {
  getNewsDetailPageData.mockResolvedValue({
    backToNewsLabel: "Back to news",
    contactCtaTitle: "Need pricing or sample support?",
    contactLabel: "Contact us",
    contentComingSoonLabel: "Coming soon",
    title: "Silica-free surface launch",
    excerpt: "A safer engineered stone option.",
    body: null,
    imageUrl: "/assets/news/news-feature.jpg",
    publishedAt: "2026-04-20T08:00:00.000Z",
    dateLabel: "April 20, 2026",
    categoryLabel: "Company News",
  });

  const { default: NewsDetailPage } = await import("./page");
  const element = await NewsDetailPage({
    params: Promise.resolve({ locale: "en", slug: "silica-free-launch" }),
    searchParams: Promise.resolve({}),
  });

  const [script] = Children.toArray(element.props.children);

  if (
    !isValidElement<{ dangerouslySetInnerHTML: { __html: string } }>(script)
  ) {
    throw new Error("Expected JSON-LD script element");
  }

  expect(JSON.parse(script.props.dangerouslySetInnerHTML.__html)).toMatchObject({
    url: "https://zylsinteredstone.com/en/news/silica-free-launch",
  });
});

test("news metadata omits hreflang URLs for unavailable locales", async () => {
  getNewsDetailPageData.mockResolvedValue({
    title: "AI training series",
    excerpt: "Training for international partners.",
    body: null,
    imageUrl: null,
  });
  getNewsAvailableLocales.mockResolvedValue(["en", "es", "ar"]);

  const { generateMetadata } = await import("./page");
  const metadata = await generateMetadata({
    params: Promise.resolve({ locale: "en", slug: "ai-training-series" }),
    searchParams: Promise.resolve({}),
  });

  expect(metadata.alternates?.languages).toEqual({
    "x-default": "/en/news/ai-training-series",
    en: "/en/news/ai-training-series",
    es: "/es/news/ai-training-series",
    ar: "/ar/news/ai-training-series",
  });
});
