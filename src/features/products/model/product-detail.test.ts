import { expect, test } from "vitest";

import type { Product } from "@/data/products";

import { buildProductDetailPageData } from "./product-detail.ts";

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
