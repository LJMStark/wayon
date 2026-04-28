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
};

test("product detail data localizes catalog attributes and avoids Chinese fallback titles outside zh", () => {
  const product: Product = {
    _id: "p1",
    slug: "lv930y09-wei-shui-ni-qian-hui",
    title: {
      en: "",
      zh: "微水泥浅灰",
      es: "",
      ar: "",
    },
    category: {
      en: "",
      zh: "特定厚度",
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

  expect(pageData.title).toBe("LV930Y09");
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
    category: {
      en: "Stone Surface",
      zh: "岩板产品",
      es: "Superficie mineral",
      ar: "سطح حجري",
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
    "Discover LV930Y09 from Stone Surface.",
    "Built for project use.",
  ]);
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
