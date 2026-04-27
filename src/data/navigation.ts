import type { AppLocale, AppMessages } from "@/i18n/types";



type NavigationMessages = AppMessages["Navigation"];

export type NavigationKey = keyof NavigationMessages;

export type ChildLink = {
  label: NavigationKey;
  href: string;
};

export type SubItem = {
  label: NavigationKey;
  href: string;
  description?: NavigationKey;
  previewImage?: string;
  children?: ChildLink[];
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
      { label: "certificate", href: "/about#certificate" },
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
          { label: "catalogProcessSkin", href: `/products?section=process&value=${encodeURIComponent("肌肤釉")}` },
          { label: "catalogProcessMirror", href: `/products?section=process&value=${encodeURIComponent("真石镜面釉")}` },
          { label: "catalogProcessDigitalMold", href: `/products?section=process&value=${encodeURIComponent("数码模具面")}` },
        ],
      },
      {
        label: "catalogCustom",
        href: "/products?section=custom",
        description: "catalogCustomDesc",
        previewImage: "/assets/showcases/showcase-5.jpg",
      },
    ],
  },
  {
    label: "solution",
    href: "/solution",
    subItems: [
      { label: "salesCooperation", href: "/solution" },
      { label: "factoryCooperation", href: "/cases" },
    ],
  },
  { label: "case", href: "/cases" },
  { label: "news", href: "/news" },
  { label: "contactUs", href: "/contact" },
];

export const LANGUAGES: Array<{
  code: Uppercase<AppLocale>;
  label: string;
  locale: AppLocale;
  icon: string;
}> = [
  { code: "ZH", label: "中文", locale: "zh", icon: "ZH" },
  { code: "EN", label: "English", locale: "en", icon: "EN" },
  { code: "ES", label: "Español", locale: "es", icon: "ES" },
  { code: "AR", label: "العربية", locale: "ar", icon: "AR" },
];
