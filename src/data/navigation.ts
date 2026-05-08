import type { AppLocale, AppMessages } from "@/i18n/types";
import {
  getLocalizedProductTitleDisplay,
  type LocalizedProductTitle,
} from "./productTitle";

type NavigationMessages = AppMessages["Navigation"];

export type NavigationKey = keyof NavigationMessages;

export type ChildLink = {
  label: NavigationKey;
  href: string;
};

export type PreviewProduct = {
  title: LocalizedProductTitle;
  href: string;
  imageSrc: string;
};

export type SubItem = {
  label: NavigationKey;
  href: string;
  description?: NavigationKey;
  previewImage?: string;
  children?: ChildLink[];
  previewProducts?: PreviewProduct[];
};

export type NavItem = {
  label: NavigationKey;
  href: string;
  mega?: boolean;
  subItems?: SubItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "home", href: "/" },
  {
    label: "aboutUs",
    href: "/about",
    subItems: [
      { label: "whoAreWe", href: "/about#who-are-we" },
      { label: "factory", href: "/about#factory" },
      { label: "download", href: "/download" },
    ],
  },
  {
    label: "collection",
    href: "/products",
    mega: true,
    subItems: [
      {
        label: "catalogSize",
        href: "/products?section=size",
        description: "catalogSizeDesc",
        previewImage: "/assets/showcases/showcase-0.jpg",
        children: [
          { label: "catalogSize800x2600", href: "/products?section=size&value=800X2600mm" },
          { label: "catalogSize900x2700", href: "/products?section=size&value=900X2700mm" },
          { label: "catalogSize900x3000", href: "/products?section=size&value=900X3000mm" },
          { label: "catalogSize900x1800", href: "/products?section=size&value=900X1800mm" },
          { label: "catalogSize1000x3000", href: "/products?section=size&value=1000X3000mm" },
          { label: "catalogSize1200x2400", href: "/products?section=size&value=1200X2400mm" },
          { label: "catalogSize1200x2700", href: "/products?section=size&value=1200X2700mm" },
          { label: "catalogSize1200x3200", href: "/products?section=size&value=1200X3200mm" },
          { label: "catalogSize1600x3200", href: "/products?section=size&value=1600X3200mm" },
        ],
      },
      {
        label: "catalogSeries",
        href: "/products?section=series",
        description: "catalogSeriesDesc",
        previewImage: "/assets/showcases/showcase-1.jpg",
        children: [
          { label: "catalogSeriesTexture", href: `/products?section=series&value=${encodeURIComponent("质感岩板")}` },
          { label: "catalogSeriesFamous", href: `/products?section=series&value=${encodeURIComponent("名石岩板")}` },
          { label: "catalogSeriesTravertine", href: `/products?section=series&value=${encodeURIComponent("洞石岩板")}` },
          { label: "catalogSeriesWood", href: `/products?section=series&value=${encodeURIComponent("木纹岩板")}` },
          { label: "catalogSeriesWallPanel", href: `/products?section=series&value=${encodeURIComponent("护墙岩板")}` },
          { label: "catalogSeriesArt", href: `/products?section=series&value=${encodeURIComponent("艺术岩板")}` },
          { label: "catalogSeriesContinuous", href: `/products?section=series&value=${encodeURIComponent("连纹岩板")}` },
          { label: "catalogSeriesTrending", href: `/products?section=series&value=${encodeURIComponent("创意网红")}` },
          { label: "catalogNewSeries", href: `/products?section=series&value=${encodeURIComponent("新品系列")}` },
        ],
      },
      {
        label: "catalogSpecialSeries",
        href: `/products?section=series&value=${encodeURIComponent("特惠系列")}`,
        description: "catalogSpecialSeriesDesc",
        previewImage:
          "https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev/ZYL1632L971%E9%9B%85%E8%AF%97%E5%85%B0%E9%BB%9B%E5%85%83%E7%B4%A0%E5%9B%BE.jpg",
        previewProducts: [
          {
            title: {
              zh: "雅诗兰黛",
            },
            href: "/products/zyl1632l971",
            imageSrc:
              "https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev/ZYL1632L971%E9%9B%85%E8%AF%97%E5%85%B0%E9%BB%9B%E5%85%83%E7%B4%A0%E5%9B%BE.jpg",
          },
          {
            title: {
              zh: "丝绸白",
            },
            href: "/products/zl1224l936",
            imageSrc:
              "https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev/ZL1224L936%E4%B8%9D%E7%BB%B8%E7%99%BD%E5%85%83%E7%B4%A0%E5%9B%BE.jpg",
          },
          {
            title: {
              zh: "伊莎贝尔白",
            },
            href: "/products/zl1632ls015",
            imageSrc:
              "https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev/ZL1632LS015%E4%BC%8A%E8%8E%8E%E8%B4%9D%E5%B0%94%E7%99%BD%E5%85%83%E7%B4%A0%E5%9B%BE.jpg",
          },
          {
            title: {
              zh: "佩拉粉玉",
            },
            href: "/products/zl1632l982",
            imageSrc:
              "https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev/ZL1632L982%E4%BD%A9%E6%8B%89%E7%B2%89%E7%8E%89%E5%85%83%E7%B4%A0%E5%9B%BE.jpg",
          },
        ],
      },
      {
        label: "catalogThickness",
        href: "/products?section=thickness",
        description: "catalogThicknessDesc",
        previewImage: "/assets/showcases/showcase-2.jpg",
        children: [
          { label: "catalogThickness3mm", href: "/products?section=thickness&value=3mm" },
          { label: "catalogThickness6mm", href: "/products?section=thickness&value=6mm" },
          { label: "catalogThickness9mm", href: "/products?section=thickness&value=9mm" },
          { label: "catalogThickness12mm", href: "/products?section=thickness&value=12mm" },
          { label: "catalogThickness15mm", href: "/products?section=thickness&value=15mm" },
        ],
      },
      {
        label: "catalogColor",
        href: "/products?section=color",
        description: "catalogColorDesc",
        previewImage: "/assets/showcases/showcase-3.jpg",
        children: [
          { label: "catalogColorWhite", href: `/products?section=color&value=${encodeURIComponent("白色")}` },
          { label: "catalogColorOffWhite", href: `/products?section=color&value=${encodeURIComponent("米白")}` },
          { label: "catalogColorBlack", href: `/products?section=color&value=${encodeURIComponent("黑色")}` },
          { label: "catalogColorGrey", href: `/products?section=color&value=${encodeURIComponent("灰色")}` },
          { label: "catalogColorBeige", href: `/products?section=color&value=${encodeURIComponent("米黄")}` },
          { label: "catalogColorBrown", href: `/products?section=color&value=${encodeURIComponent("棕色")}` },
        ],
      },
      {
        label: "catalogProcess",
        href: "/products?section=process",
        description: "catalogProcessDesc",
        previewImage: "/assets/showcases/showcase-4.jpg",
        children: [
          { label: "catalogProcessPolished", href: `/products?section=process&value=${encodeURIComponent("亮光")}` },
          { label: "catalogProcessMatte", href: `/products?section=process&value=${encodeURIComponent("哑光")}` },
          { label: "catalogProcessLuxGlaze", href: `/products?section=process&value=${encodeURIComponent("亮面(奢石釉)")}` },
          { label: "catalogProcessMirror", href: `/products?section=process&value=${encodeURIComponent("真石镜面釉")}` },
          { label: "catalogProcessSkin", href: `/products?section=process&value=${encodeURIComponent("肌肤釉")}` },
          { label: "catalogProcessTranslucent", href: `/products?section=process&value=${encodeURIComponent("透光石")}` },
          { label: "catalogProcessHighWhite", href: `/products?section=process&value=${encodeURIComponent("高白")}` },
          { label: "catalogProcessDigitalMold", href: `/products?section=process&value=${encodeURIComponent("数码模具面")}` },
          { label: "catalogProcessFlamed", href: `/products?section=process&value=${encodeURIComponent("火烧面")}` },
          { label: "catalogProcessCarved", href: `/products?section=process&value=${encodeURIComponent("精雕")}` },
          { label: "catalogProcessRetro", href: `/products?section=process&value=${encodeURIComponent("复刻釉")}` },
          { label: "catalogProcessCrystal", href: `/products?section=process&value=${encodeURIComponent("定位彩晶")}` },
        ],
      },
      {
        label: "catalogCustom",
        href: "/products?section=custom",
        description: "catalogCustomDesc",
        previewImage: "/assets/showcases/showcase-5.jpg",
        children: [
          { label: "catalogCustomSize", href: "/contact" },
          { label: "catalogCustomThickness", href: "/contact" },
          { label: "catalogCustomSurfaceFinish", href: "/contact" },
          { label: "catalogCustomColor", href: "/contact" },
          { label: "catalogCustomCuttingProcessing", href: "/contact" },
          { label: "catalogCustomPatternDesign", href: `/products?section=custom&value=${encodeURIComponent("custom-pattern-design")}` },
          { label: "catalogCustomHotBending", href: "/contact" },
          { label: "catalogCustomLogoBranding", href: "/contact" },
        ],
      },
    ],
  },
  { label: "solution", href: "/solution" },
  { label: "case", href: "/cases" },
  { label: "news", href: "/news" },
  { label: "contactUs", href: "/contact" },
];

export type LanguageOption = {
  code: Uppercase<AppLocale>;
  label: string;
  nonChineseLabel?: string;
  locale: AppLocale;
  icon: string;
};

export const LANGUAGES: LanguageOption[] = [
  {
    code: "ZH",
    label: "中文",
    nonChineseLabel: "Chinese",
    locale: "zh",
    icon: "ZH",
  },
  { code: "EN", label: "English", locale: "en", icon: "EN" },
  { code: "ES", label: "Español", locale: "es", icon: "ES" },
  { code: "AR", label: "العربية", locale: "ar", icon: "AR" },
];

export function resolveLanguageLabel(
  language: LanguageOption,
  activeLocale: AppLocale
): string {
  if (activeLocale === "zh") {
    return language.label;
  }

  return language.nonChineseLabel ?? language.label;
}

export function resolvePreviewProductTitle(
  product: PreviewProduct,
  locale: AppLocale
): string {
  return getLocalizedProductTitleDisplay(
    product.title,
    locale,
    product.href.split("/").at(-1) || ""
  );
}
