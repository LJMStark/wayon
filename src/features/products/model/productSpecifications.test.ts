import { expect, test } from "vitest";

import { buildProductSpecifications } from "./productSpecifications.ts";
import type {
  ProductDetailPageLabels,
  ProductDetailVariantData,
} from "../types";

const labels: ProductDetailPageLabels = {
  variantSelector: "Variant",
  productCode: "Code",
  colorGroup: "Color",
  size: "Size",
  process: "Process",
  faceCount: "Face Count",
  facePatternNote: "Pattern Note",
  thickness: "Thickness",
  elementImages: "Element Images",
  spaceImages: "Space Images",
  realImages: "Real Photos",
  videos: "Videos",
  videoFallback: "Video is not supported.",
  relatedProducts: "Similar Products",
};

test("product detail specifications keep only size, thickness, color, and process in order", () => {
  const variant: ProductDetailVariantData = {
    code: "ZL927L077S",
    showCode: true,
    optionLabel: "900X2700mm / 9mm / High gloss / ZL927L077S",
    size: "900X2700mm",
    thickness: "9mm",
    colorGroup: "Red",
    process: "High gloss",
    faceCount: "Single Face",
    facePatternNote: "Single Face",
    elementImages: [],
    spaceImages: [],
    realImages: [],
    videos: [],
  };

  expect(buildProductSpecifications(variant, labels)).toEqual([
    { label: "Size", value: "900X2700mm" },
    { label: "Thickness", value: "9mm" },
    { label: "Color", value: "Red" },
    { label: "Process", value: "High gloss" },
  ]);
});
