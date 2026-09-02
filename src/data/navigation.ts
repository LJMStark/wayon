import type { AppLocale, AppMessages } from "@/i18n/types";
import { buildCatalogHref } from "@/features/products/model/catalogUrl";
import { mediaAssetUrl } from "@/data/mediaBaseUrl";

// Curated nav preview art, stored in the media bucket. Object keys keep their
// percent-encoded CJK filenames; see ./mediaBaseUrl.ts for how the origin is
// resolved (and why it must match on server and client).
const NAV_PREVIEW_IMAGES = {
  yaShiLanDai: mediaAssetUrl(
    "ZYL1632L971%E9%9B%85%E8%AF%97%E5%85%B0%E9%BB%9B%E5%85%83%E7%B4%A0%E5%9B%BE.jpg"
  ),
  siChouBai: mediaAssetUrl(
    "ZL1224L936%E4%B8%9D%E7%BB%B8%E7%99%BD%E5%85%83%E7%B4%A0%E5%9B%BE.jpg"
  ),
  yiShaBeiErBai: mediaAssetUrl(
    "ZL1632LS015%E4%BC%8A%E8%8E%8E%E8%B4%9D%E5%B0%94%E7%99%BD%E5%85%83%E7%B4%A0%E5%9B%BE.jpg"
  ),
  peiLaFenYu: mediaAssetUrl(
    "ZL1632L982%E4%BD%A9%E6%8B%89%E7%B2%89%E7%8E%89%E5%85%83%E7%B4%A0%E5%9B%BE.jpg"
  ),
} as const;

// Locally defined to keep this module — which is imported by the client
// Header component — free of `pinyin-pro` (~200KB gzipped pulled in via
// src/data/productTitle.ts). The full Pinyin transliteration pipeline
// stays on the server side for CMS-driven product pages; the navigation
// preview products below are a hand-curated short list, so their
// per-locale strings are inlined statically.
export type LocalizedProductTitle = Partial<Record<AppLocale, string>> & {
  zh?: string;
};

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
      { label: "certifications", href: "/about#certifications" },
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
          { label: "catalogSize800x2600", href: buildCatalogHref("size", "800X2600mm") },
          { label: "catalogSize900x2700", href: buildCatalogHref("size", "900X2700mm") },
          { label: "catalogSize900x3000", href: buildCatalogHref("size", "900X3000mm") },
          { label: "catalogSize900x1800", href: buildCatalogHref("size", "900X1800mm") },
          { label: "catalogSize1000x3000", href: buildCatalogHref("size", "1000X3000mm") },
          { label: "catalogSize1200x2400", href: buildCatalogHref("size", "1200X2400mm") },
          { label: "catalogSize1200x2700", href: buildCatalogHref("size", "1200X2700mm") },
          { label: "catalogSize1200x3200", href: buildCatalogHref("size", "1200X3200mm") },
          { label: "catalogSize1600x3200", href: buildCatalogHref("size", "1600X3200mm") },
        ],
      },
      {
        label: "catalogSeries",
        href: "/products?section=series",
        description: "catalogSeriesDesc",
        previewImage: "/assets/showcases/showcase-1.jpg",
        children: [
          { label: "catalogSeriesTexture", href: buildCatalogHref("series", "质感岩板") },
          { label: "catalogSeriesFamous", href: buildCatalogHref("series", "名石岩板") },
          { label: "catalogSeriesTravertine", href: buildCatalogHref("series", "洞石岩板") },
          { label: "catalogSeriesWood", href: buildCatalogHref("series", "木纹岩板") },
          { label: "catalogSeriesWallPanel", href: buildCatalogHref("series", "护墙岩板") },
          { label: "catalogSeriesArt", href: buildCatalogHref("series", "艺术岩板") },
          { label: "catalogSeriesContinuous", href: buildCatalogHref("series", "连纹岩板") },
          { label: "catalogSeriesTrending", href: buildCatalogHref("series", "创意网红") },
          { label: "catalogNewSeries", href: buildCatalogHref("series", "新品系列") },
        ],
      },
      {
        label: "catalogSpecialSeries",
        href: buildCatalogHref("series", "特惠系列"),
        description: "catalogSpecialSeriesDesc",
        previewImage: NAV_PREVIEW_IMAGES.yaShiLanDai,
        previewProducts: [
          {
            // Non-zh strings inlined (matching getLocalizedProductTitleDisplay
            // output) so this curated list does not pull pinyin-pro into the
            // client bundle through the Header component.
            title: {
              zh: "雅诗兰黛",
              en: "YA SHI LAN DAI",
              es: "YA SHI LAN DAI",
              ar: "YA SHI LAN DAI",
            },
            href: "/products/zyl1632l971",
            imageSrc: NAV_PREVIEW_IMAGES.yaShiLanDai,
          },
          {
            title: {
              zh: "丝绸白",
              en: "SI CHOU BAI",
              es: "SI CHOU BAI",
              ar: "SI CHOU BAI",
            },
            href: "/products/zl1224l936",
            imageSrc: NAV_PREVIEW_IMAGES.siChouBai,
          },
          {
            title: {
              zh: "伊莎贝尔白",
              en: "YI SHA BEI ER BAI",
              es: "YI SHA BEI ER BAI",
              ar: "YI SHA BEI ER BAI",
            },
            href: "/products/zl1632ls015",
            imageSrc: NAV_PREVIEW_IMAGES.yiShaBeiErBai,
          },
          {
            title: {
              zh: "佩拉粉玉",
              en: "PEI LA FEN YU",
              es: "PEI LA FEN YU",
              ar: "PEI LA FEN YU",
            },
            href: "/products/zl1632l982",
            imageSrc: NAV_PREVIEW_IMAGES.peiLaFenYu,
          },
        ],
      },
      {
        label: "catalogThickness",
        href: "/products?section=thickness",
        description: "catalogThicknessDesc",
        previewImage: "/assets/showcases/showcase-2.jpg",
        children: [
          { label: "catalogThickness3mm", href: buildCatalogHref("thickness", "3mm") },
          { label: "catalogThickness6mm", href: buildCatalogHref("thickness", "6mm") },
          { label: "catalogThickness9mm", href: buildCatalogHref("thickness", "9mm") },
          { label: "catalogThickness12mm", href: buildCatalogHref("thickness", "12mm") },
          { label: "catalogThickness15mm", href: buildCatalogHref("thickness", "15mm") },
        ],
      },
      {
        label: "catalogColor",
        href: "/products?section=color",
        description: "catalogColorDesc",
        previewImage: "/assets/showcases/showcase-3.jpg",
        children: [
          { label: "catalogColorWhite", href: buildCatalogHref("color", "白色") },
          { label: "catalogColorOffWhite", href: buildCatalogHref("color", "米白") },
          { label: "catalogColorBlack", href: buildCatalogHref("color", "黑色") },
          { label: "catalogColorGrey", href: buildCatalogHref("color", "灰色") },
          { label: "catalogColorBeige", href: buildCatalogHref("color", "米黄") },
          { label: "catalogColorBrown", href: buildCatalogHref("color", "棕色") },
        ],
      },
      {
        label: "catalogProcess",
        href: "/products?section=process",
        description: "catalogProcessDesc",
        previewImage: "/assets/showcases/showcase-4.jpg",
        children: [
          { label: "catalogProcessPolished", href: buildCatalogHref("process", "亮光") },
          { label: "catalogProcessMatte", href: buildCatalogHref("process", "哑光") },
          { label: "catalogProcessLuxGlaze", href: buildCatalogHref("process", "亮面(奢石釉)") },
          { label: "catalogProcessMirror", href: buildCatalogHref("process", "真石镜面釉") },
          { label: "catalogProcessSkin", href: buildCatalogHref("process", "肌肤釉") },
          { label: "catalogProcessTranslucent", href: buildCatalogHref("process", "透光石") },
          { label: "catalogProcessHighWhite", href: buildCatalogHref("process", "高白") },
          { label: "catalogProcessDigitalMold", href: buildCatalogHref("process", "数码模具面") },
          { label: "catalogProcessFlamed", href: buildCatalogHref("process", "火烧面") },
          { label: "catalogProcessCarved", href: buildCatalogHref("process", "精雕") },
          { label: "catalogProcessRetro", href: buildCatalogHref("process", "复刻釉") },
          { label: "catalogProcessCrystal", href: buildCatalogHref("process", "定位彩晶") },
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
          { label: "catalogCustomPatternDesign", href: buildCatalogHref("custom", "custom-pattern-design") },
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
  const fallbackSlug = product.href.split("/").at(-1) || "";
  if (locale === "zh") {
    return product.title.zh ?? fallbackSlug;
  }
  // Non-zh locales display the inlined Pinyin string. Fall back to en
  // (always populated for the curated nav list above) then zh then slug.
  return (
    product.title[locale] ??
    product.title.en ??
    product.title.zh ??
    fallbackSlug
  );
}
