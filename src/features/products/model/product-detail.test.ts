import { expect, test } from "vitest";

import type { Product } from "@/data/products";

import {
  buildProductDetailPageData,
  buildProductMetadataDescription,
} from "./product-detail.ts";

const detailCopy = {
  categoryFallback: "Stone Surface",
  description1: "Discover {title} from {category}.",
  description2: "Built for project use.",
  variantSelectorLabel: "Variant",
  productCodeLabel: "Code",
  colorGroupLabel: "Color",
  sizeLabel: "Size",
  processLabel: "Process",
  faceCountLabel: "Face Count",
  facePatternNoteLabel: "Pattern Note",
  thicknessLabel: "Thickness",
  elementImagesTitle: "Element Images",
  spaceImagesTitle: "Space Images",
  realImagesTitle: "Real Photos",
  videosTitle: "Videos",
  videoFallback: "Video is not supported.",
  relatedProductsTitle: "Similar Products",
};

test("product detail data localizes catalog attributes and transliterates Chinese fallback titles outside zh", () => {
  const product: Product = {
    _id: "p1",
    slug: "lv930y09-wei-shui-ni-qian-hui",
    title: {
      en: "",
      zh: "微水泥浅灰",
      es: "",
      ar: "",
    },
    published: true,
    seriesTypes: ["质感岩板"],
    variants: [
      {
        code: "LV930Y09",
        size: "900X3000mm",
        thickness: "9mm",
        process: "哑光",
        colorGroup: "灰色",
        faceCount: "单面",
        elementImages: [],
        spaceImages: [],
        realImages: [],
        videos: [],
      },
    ],
  };

  const pageData = buildProductDetailPageData(product, "es", {
    backLabel: "Volver",
    requestSampleLabel: "Solicitar muestra",
    detail: detailCopy,
  });

  expect(pageData.title).toBe("WEI SHUI NI QIAN HUI");
  expect(pageData.category).toBe("Losa textura");
  expect(pageData.seriesTypes).toEqual(["Losa textura"]);
  expect(pageData.variants[0]?.process).toBe("Mate");
  expect(pageData.variants[0]?.colorGroup).toBe("Gris");
  expect(pageData.variants[0]?.faceCount).toBe("1 cara");
  expect(pageData.variants[0]?.optionLabel).toBe(
    "900X3000mm / 9mm / Mate / LV930Y09"
  );
});

test("product detail data uses product-level localized description before template copy", () => {
  const product: Product = {
    _id: "p2",
    slug: "aurora-white",
    title: {
      en: "Aurora White",
      zh: "极光白",
      es: "Aurora White",
      ar: "Aurora White",
    },
    description: {
      en: "Soft white movement gives Aurora White a clean, luminous look.\nIt suits counters, walls and furniture surfaces.",
      zh: "极光白带有柔和白色纹理，空间表现明亮干净。",
      es: "El movimiento blanco suave aporta una presencia luminosa.",
      ar: "تمنح العروق البيضاء الناعمة حضورا مضيئا.",
    },
    published: true,
    seriesTypes: [],
    variants: [],
  };

  const pageData = buildProductDetailPageData(product, "en", {
    backLabel: "Back",
    requestSampleLabel: "Request sample",
    detail: detailCopy,
  });

  expect(pageData.descriptionParagraphs).toEqual([
    "Soft white movement gives Aurora White a clean, luminous look.",
    "It suits counters, walls and furniture surfaces.",
  ]);
});

test("product detail data does not fall back to Chinese descriptions outside zh", () => {
  const product: Product = {
    _id: "p3",
    slug: "lv930y09-wei-shui-ni-qian-hui",
    title: {
      en: "",
      zh: "微水泥浅灰",
      es: "",
      ar: "",
    },
    description: {
      en: "",
      zh: "这是一段中文产品文案。",
      es: "",
      ar: "",
    },
    published: true,
    seriesTypes: [],
    variants: [
      {
        code: "LV930Y09",
        size: "900X3000mm",
        elementImages: [],
        spaceImages: [],
        realImages: [],
        videos: [],
      },
    ],
  };

  const pageData = buildProductDetailPageData(product, "es", {
    backLabel: "Volver",
    requestSampleLabel: "Solicitar muestra",
    detail: detailCopy,
  });

  expect(pageData.descriptionParagraphs).toEqual([
    "Discover WEI SHUI NI QIAN HUI from Stone Surface.",
    "Built for project use.",
  ]);
});

test("product detail media images prefer the feature size variant, falling back to the original", () => {
  const product: Product = {
    _id: "p-feature",
    slug: "feature-sized",
    title: {
      en: "Feature Sized",
      zh: "特征尺寸",
      es: "Feature Sized",
      ar: "Feature Sized",
    },
    published: true,
    seriesTypes: [],
    variants: [
      {
        code: "FS",
        elementImages: [
          {
            sourcePath: "e1",
            publicUrl: "/e1.jpg",
            featureUrl: "/e1-feature.jpg",
          },
          { sourcePath: "e2", publicUrl: "/e2.jpg" },
        ],
        spaceImages: [],
        realImages: [],
        videos: [],
      },
    ],
  };

  const pageData = buildProductDetailPageData(product, "en", {
    backLabel: "Back",
    requestSampleLabel: "Request sample",
    detail: detailCopy,
  });

  const images = pageData.variants[0]?.elementImages ?? [];
  expect(images[0]?.publicUrl).toBe("/e1-feature.jpg");
  expect(images[1]?.publicUrl).toBe("/e2.jpg");
});

test("product metadata description uses product copy before category template", () => {
  const product: Product = {
    _id: "p4",
    slug: "linen-grey",
    title: {
      en: "Linen Grey",
      zh: "亚麻灰",
      es: "Linen Grey",
      ar: "Linen Grey",
    },
    description: {
      en: "A woven grey texture with a restrained architectural tone.",
      zh: "",
      es: "",
      ar: "",
    },
    published: true,
    seriesTypes: [],
    variants: [],
  };

  const description = buildProductMetadataDescription(
    product,
    "en",
    "Linen Grey",
    "Stone Surface",
    detailCopy,
    "View specifications for {title}, a {category} surface."
  );

  expect(description).toBe(
    "A woven grey texture with a restrained architectural tone."
  );
  expect(description).not.toContain("Stone Surface");
});

test("product detail data recommends similar products and excludes the current product", () => {
  const source: Product = {
    _id: "p5",
    slug: "quartz-a",
    title: {
      en: "Quartz A",
      zh: "石英石 A",
      es: "Quartz A",
      ar: "Quartz A",
    },
    published: true,
    sortOrder: 10,
    seriesTypes: ["名石岩板"],
    variants: [
      {
        code: "QA",
        size: "1600X3200mm",
        thickness: "12mm",
        process: "哑光",
        colorGroup: "白色",
        elementImages: [],
        spaceImages: [],
        realImages: [],
        videos: [],
      },
    ],
  };
  const sameCategory: Product = {
    _id: "p6",
    slug: "quartz-b",
    title: {
      en: "Quartz B",
      zh: "石英石 B",
      es: "Quartz B",
      ar: "Quartz B",
    },
    published: true,
    sortOrder: 20,
    coverImageUrl: "/quartz-b.jpg",
    seriesTypes: ["名石岩板"],
    variants: [
      {
        code: "QB",
        size: "1600X3200mm",
        thickness: "12mm",
        process: "哑光",
        elementImages: [],
        spaceImages: [],
        realImages: [],
        videos: [],
      },
    ],
  };
  const sameCategoryLowerScore: Product = {
    _id: "p7",
    slug: "quartz-c",
    title: {
      en: "Quartz C",
      zh: "石英石 C",
      es: "Quartz C",
      ar: "Quartz C",
    },
    published: true,
    sortOrder: 15,
    seriesTypes: ["名石岩板"],
    variants: [
      {
        code: "QC",
        size: "800X2600mm",
        elementImages: [],
        spaceImages: [],
        realImages: [],
        videos: [],
      },
    ],
  };
  const sameSeries: Product = {
    _id: "p8",
    slug: "same-series",
    title: {
      en: "Same Series",
      zh: "同系列",
      es: "Same Series",
      ar: "Same Series",
    },
    published: true,
    sortOrder: 1,
    seriesTypes: ["名石岩板"],
    variants: [],
  };
  const unrelated: Product = {
    _id: "p9",
    slug: "unrelated",
    title: {
      en: "Unrelated",
      zh: "无关产品",
      es: "Unrelated",
      ar: "Unrelated",
    },
    published: true,
    sortOrder: 1,
    seriesTypes: ["艺术岩板"],
    variants: [],
  };

  const pageData = buildProductDetailPageData(
    source,
    "en",
    {
      backLabel: "Back",
      requestSampleLabel: "Request sample",
      detail: detailCopy,
    },
    [source, sameCategory, sameCategoryLowerScore, sameSeries, unrelated]
  );

  expect(pageData.labels.relatedProducts).toBe("Similar Products");
  expect(pageData.relatedProducts.map((product) => product.slug)).toEqual([
    "quartz-b",
    "same-series",
    "quartz-c",
  ]);
  expect(pageData.relatedProducts[0]).toMatchObject({
    title: "SHI YING SHI B",
    category: "Classic Stone Slab",
    coverImageUrl: "/quartz-b.jpg",
    summaryTags: ["1600X3200mm", "12mm", "Matte"],
  });
});
