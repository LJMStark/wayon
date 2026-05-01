import { expect, test, vi } from "vitest";

const mockProducts = vi.hoisted(() => [
  {
    _id: "standard-1",
    slug: "xi-nai-jin",
    title: { zh: "西奈金", en: "Sinai Gold", es: "", ar: "" },
    category: { zh: "岩板产品", en: "Slabs", es: "", ar: "" },
    catalogMode: "standard" as const,
    seriesTypes: ["名石岩板"],
    coverImageUrl: "/standard.jpg",
    variants: [
      {
        code: "LV826L064",
        size: "800X2600mm",
        thickness: "9mm",
        process: "亮光",
        colorGroup: "金黄色",
      },
    ],
  },
  {
    _id: "custom-1",
    slug: "custom-surface-sample",
    title: { zh: "定制表面案例", en: "Custom Surface Sample", es: "", ar: "" },
    category: { zh: "定制产品", en: "Custom Products", es: "", ar: "" },
    catalogMode: "custom" as const,
    customCapability: "custom-surface",
    seriesTypes: [],
    coverImageUrl: "/custom.jpg",
    variants: [{ code: "CUSTOM-001" }],
  },
]);

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("@/data/products", () => ({
  getCustomCapabilities: async () => [
    {
      _id: "capability-1",
      capabilityKey: "custom-surface",
      title: { zh: "定制表面", en: "Custom Surface", es: "", ar: "" },
      description: { zh: "", en: "", es: "", ar: "" },
      coverImageUrl: "/custom-section.jpg",
      sortOrder: 0,
    },
  ],
  getProductDisplayCategory: (
    product: (typeof mockProducts)[number],
    locale: keyof (typeof mockProducts)[number]["category"]
  ) => product.category[locale] || product.category.zh,
  getProductDisplayTitle: (
    product: (typeof mockProducts)[number],
    locale: keyof (typeof mockProducts)[number]["title"]
  ) => product.title[locale] || product.title.zh,
  getProductImage: (product: (typeof mockProducts)[number]) => product.coverImageUrl,
  getProductVariants: (product: (typeof mockProducts)[number]) => product.variants,
  getProductsDirectory: async () => mockProducts,
}));

test("keyword search scans the full product directory, including custom product codes", async () => {
  const { getProductsPageData } = await import("./getProductsPageData");

  const data = await getProductsPageData("zh", { q: "CUSTOM-001" });

  expect(data.products.map((product) => product.slug)).toEqual([
    "custom-surface-sample",
  ]);
});
