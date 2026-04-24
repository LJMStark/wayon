import type { NavigationKey } from "@/data/navigation";
import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "../model/productExposure";

type ProductCategoryShowcaseContent = {
  slug: string;
  titleKey: NavigationKey;
  descriptionKey: NavigationKey;
  imageSrc: string;
  background: "gray" | "white";
};

export const PRODUCT_CATEGORY_SHOWCASES: ProductCategoryShowcaseContent[] = [
  {
    slug: "size",
    titleKey: "catalogSize",
    descriptionKey: "catalogSizeDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
  {
    slug: "series",
    titleKey: "catalogSeries",
    descriptionKey: "catalogSeriesDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "white",
  },
  {
    slug: "thickness",
    titleKey: "catalogThickness",
    descriptionKey: "catalogThicknessDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
  {
    slug: "color",
    titleKey: "catalogColor",
    descriptionKey: "catalogColorDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "white",
  },
  {
    slug: "process",
    titleKey: "catalogProcess",
    descriptionKey: "catalogProcessDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
  {
    slug: "custom",
    titleKey: "catalogCustom",
    descriptionKey: "catalogCustomDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "white",
  },
];
