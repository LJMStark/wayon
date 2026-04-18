import type { AppLocale, AppMessages } from "@/i18n/types";

import { buildCategoryProductsHref } from "./navigationCategoryMap";

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
        label: "quartzStone",
        href: buildCategoryProductsHref("quartz"),
        description: "quartzDesc",
        previewImage: "/assets/solutions/quartz-zero-silica.jpg",
        children: [
          { label: "quartzNatural", href: "/products#quartz" },
          { label: "quartzPure", href: "/products#quartz" },
          { label: "quartzCrystal", href: "/products#quartz" },
          { label: "quartzMultiColor", href: "/products#quartz" },
          { label: "quartzPlatinum", href: "/products#quartz" },
        ],
      },
      {
        label: "terrazzo",
        href: buildCategoryProductsHref("terrazzo"),
        description: "terrazzoDesc",
        previewImage: "/assets/solutions/terrazzo.jpg",
        children: [
          { label: "terrazzoColourful", href: "/products#terrazzo" },
          { label: "terrazzoWhite", href: "/products#terrazzo" },
          { label: "terrazzoGreyBlack", href: "/products#terrazzo" },
          { label: "terrazzoNanoTech", href: "/products#terrazzo" },
        ],
      },
      {
        label: "flexibleStone",
        href: buildCategoryProductsHref("flexible-stone"),
        description: "flexibleDesc",
        previewImage: "/assets/solutions/flexible-stone.jpg",
        children: [
          { label: "flexibleStoneMimic", href: "/products#flexible-stone" },
          { label: "flexibleVeinFlow", href: "/products#flexible-stone" },
          { label: "flexibleArtisanCraft", href: "/products#flexible-stone" },
        ],
      },
      {
        label: "marble",
        href: buildCategoryProductsHref("marble"),
        description: "marbleDesc",
        previewImage: "/assets/solutions/marble.jpg",
        children: [
          { label: "marbleBeige", href: "/products#marble" },
          { label: "marbleGrayBrown", href: "/products#marble" },
          { label: "marbleBlackWhite", href: "/products#marble" },
          { label: "marbleTravertine", href: "/products#marble" },
          { label: "marbleLuxury", href: "/products#marble" },
        ],
      },
      {
        label: "gemStone",
        href: buildCategoryProductsHref("gem-stone"),
        description: "gemDesc",
        previewImage: "/assets/solutions/gem-stone.jpg",
        children: [
          { label: "gemAgate", href: "/products#gem-stone" },
          { label: "gemOther", href: "/products#gem-stone" },
          { label: "gemCrystal", href: "/products#gem-stone" },
        ],
      },
      {
        label: "cementStone",
        href: buildCategoryProductsHref("cement-stone"),
        description: "cementDesc",
        previewImage: "/assets/solutions/cement-stone.jpg",
        children: [
          { label: "cementPure", href: "/products#cement-stone" },
          { label: "cementSandstone", href: "/products#cement-stone" },
          { label: "cementLine", href: "/products#cement-stone" },
        ],
      },
      {
        label: "artificialMarble",
        href: buildCategoryProductsHref("artificial-marble"),
        description: "artificialDesc",
        previewImage: "/assets/solutions/artificial-marble.webp",
        children: [
          { label: "artificialWhite", href: "/products#artificial-marble" },
          { label: "artificialGrey", href: "/products#artificial-marble" },
          { label: "artificialYellow", href: "/products#artificial-marble" },
          { label: "artificialBlack", href: "/products#artificial-marble" },
        ],
      },
      {
        label: "porcelainSlab",
        href: buildCategoryProductsHref("porcelain-slab"),
        description: "porcelainDesc",
        previewImage: "/assets/solutions/porcelain-slab.webp",
        children: [
          { label: "porcelainClassic", href: "/products#porcelain-slab" },
          { label: "porcelainCalacatta", href: "/products#porcelain-slab" },
          { label: "porcelainLuxury", href: "/products#porcelain-slab" },
          { label: "porcelain12mm", href: "/products#porcelain-slab" },
          { label: "porcelain20mm", href: "/products#porcelain-slab" },
        ],
      },
      {
        label: "silicaFree",
        href: buildCategoryProductsHref("silica-free"),
        description: "silicaDesc",
        previewImage: "/assets/categories/silica-free-stone.jpg",
      },
    ],
  },
  {
    label: "solution",
    href: "/solution",
    subItems: [
      { label: "finishedProducts", href: "/solution" },
      { label: "applicationField", href: "/solution" },
      { label: "project", href: "/solution#case" },
      { label: "view360", href: "/solution" },
    ],
  },
  { label: "case", href: "/solution#case" },
  { label: "news", href: "/news" },
  { label: "contactUs", href: "/contact" },
];

export const LANGUAGES: Array<{
  code: Uppercase<AppLocale>;
  label: string;
  locale: AppLocale;
  icon: string;
}> = [
  { code: "ZH", label: "中文", locale: "zh", icon: "🇨🇳" },
  { code: "EN", label: "English", locale: "en", icon: "🇬🇧" },
  { code: "ES", label: "Español", locale: "es", icon: "🇪🇸" },
  { code: "AR", label: "العربية", locale: "ar", icon: "🇦🇪" },
  { code: "RU", label: "Русский", locale: "ru", icon: "🇷🇺" },
];
