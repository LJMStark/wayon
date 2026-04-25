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
    imageSrc: "/assets/showcases/showcase-0.jpg",
    background: "gray",
  },
  {
    slug: "series",
    titleKey: "catalogSeries",
    descriptionKey: "catalogSeriesDesc",
    imageSrc: "/assets/showcases/showcase-1.jpg",
    background: "white",
  },
  {
    slug: "thickness",
    titleKey: "catalogThickness",
    descriptionKey: "catalogThicknessDesc",
    imageSrc: "/assets/showcases/showcase-2.jpg",
    background: "gray",
  },
  {
    slug: "color",
    titleKey: "catalogColor",
    descriptionKey: "catalogColorDesc",
    imageSrc: "/assets/showcases/showcase-3.jpg",
    background: "white",
  },
  {
    slug: "process",
    titleKey: "catalogProcess",
    descriptionKey: "catalogProcessDesc",
    imageSrc: "/assets/showcases/showcase-4.jpg",
    background: "gray",
  },
  {
    slug: "custom",
    titleKey: "catalogCustom",
    descriptionKey: "catalogCustomDesc",
    imageSrc: "/assets/showcases/showcase-5.jpg",
    background: "white",
  },
];
