import { expect, test, vi } from "vitest";

const getProductSlugs = vi.fn(async () =>
  Array.from({ length: 1905 }, (_, index) => ({
    slug: `product-${index}`,
    updatedAt: "2026-07-24T00:00:00.000Z",
  }))
);

vi.mock("@/data/products", () => ({
  getProductBySlug: vi.fn(),
  getProductDisplayCategory: vi.fn(),
  getProductDisplayTitle: vi.fn(),
  getProductSlugs,
}));

vi.mock("@/features/products/components/ProductDetailPageView", () => ({
  ProductDetailPageView: () => null,
}));

vi.mock("@/features/products/server/getProductDetailPageData", () => ({
  getProductDetailPageData: vi.fn(),
}));

vi.mock("@/data/siteCopy", () => ({
  formatCopy: vi.fn(),
  getMetadataCopy: vi.fn(),
  getProductDetailPageCopy: vi.fn(),
}));

vi.mock("@/features/products/model/product-detail", () => ({
  buildProductMetadataDescription: vi.fn(),
}));

vi.mock("@/features/products/model/productExposure", () => ({
  isPublishedProduct: vi.fn(),
}));

vi.mock("@/features/shared/server/locale", () => ({
  getLocaleParams: vi.fn(),
}));

vi.mock("@/lib/jsonLd", () => ({
  productBreadcrumbJsonLd: vi.fn(),
  productJsonLd: vi.fn(),
}));

vi.mock("@/lib/metadata", () => ({
  buildPageMetadata: vi.fn(),
  normalizeMetadataPath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

test("product detail pages are generated on demand instead of all at build time", async () => {
  const { generateStaticParams } = await import("./page");

  expect(generateStaticParams()).toEqual([]);
  expect(getProductSlugs).not.toHaveBeenCalled();
});
