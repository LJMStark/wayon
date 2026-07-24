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

const rawProducts = Array.from({ length: 1001 }, (_, index) => ({
  id: `product-${index}`,
  title: { en: `Product ${index}`, zh: "", es: "", ar: "" },
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
  await expect(getProducts()).resolves.toHaveLength(1001);
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({ pagination: false })
  );
});

test("the product sitemap is not truncated at 1000 products", async () => {
  await expect(getProductSlugs()).resolves.toHaveLength(1001);
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({ pagination: false })
  );
});
