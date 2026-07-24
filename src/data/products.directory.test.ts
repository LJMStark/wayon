import { beforeEach, expect, test, vi } from "vitest";

const { find } = vi.hoisted(() => ({
  find: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (loader: unknown) => loader,
}));

vi.mock("@/data/_payload", () => ({
  encodeMediaUrl: (value: string) => value,
  getPayloadClient: vi.fn(async () => ({ find })),
  localizedString: (value: unknown) => value,
  mediaUrl: () => undefined,
  relationshipValue: () => null,
}));

import { getProducts, getProductSlugs } from "./products";

const PRODUCT_COUNT = 1905;
const NEXT_DATA_CACHE_MAX_BYTES = 2 * 1024 * 1024;
const localizedDescription = {
  en: "x".repeat(400),
  zh: "中".repeat(400),
  es: "x".repeat(400),
  ar: "x".repeat(400),
};

const rawProducts = Array.from({ length: PRODUCT_COUNT }, (_, index) => ({
  id: `product-${index}`,
  title: { en: `Product ${index}`, zh: "", es: "", ar: "" },
  description: localizedDescription,
  slug: `product-${index}`,
  productCode: `CODE-${index}`,
  published: true,
  updatedAt: "2026-07-24T00:00:00.000Z",
}));

beforeEach(() => {
  find.mockReset();
  find.mockImplementation(
    async ({
      limit,
      pagination,
    }: {
      limit?: number;
      pagination?: boolean;
    }) => ({
      docs:
        pagination === false
          ? rawProducts
          : rawProducts.slice(0, limit ?? 10),
    })
  );
});

test("the product directory is not truncated at 1000 products", async () => {
  await expect(getProducts()).resolves.toHaveLength(PRODUCT_COUNT);
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({ pagination: false })
  );
});

test("the complete product directory fits in one Next.js data cache entry", async () => {
  const products = await getProducts();
  const serializedBytes = Buffer.byteLength(JSON.stringify(products));

  expect(serializedBytes).toBeLessThan(NEXT_DATA_CACHE_MAX_BYTES);
});

test("the product sitemap is not truncated at 1000 products", async () => {
  await expect(getProductSlugs()).resolves.toHaveLength(PRODUCT_COUNT);
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({ pagination: false })
  );
});
