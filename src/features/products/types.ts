export type ProductCategoryShowcase = {
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  background: "gray" | "white";
};

export type ProductCatalogSectionKey =
  | "size"
  | "series"
  | "thickness"
  | "color"
  | "process"
  | "custom";

export type ProductCatalogMode = "standard" | "custom";

export type ProductCatalogNavSection = {
  key: ProductCatalogSectionKey;
  label: string;
};

export type ProductTaxonomyCard = {
  key: string;
  value: string;
  label: string;
  description?: string;
  imageSrc?: string;
  count: number;
};

export type ProductCustomCapabilitySummary = {
  key: string;
  title: string;
  description?: string;
  imageSrc?: string;
  sortOrder: number;
  count: number;
};

export type ProductDirectoryVariantSummary = {
  code: string;
  size?: string;
  thickness?: string;
  process?: string;
  colorGroup?: string;
};

export type ProductDirectoryItem = {
  slug: string;
  title: string;
  category: string;
  categorySlug?: string;
  catalogMode: ProductCatalogMode;
  customCapability?: string;
  seriesTypes: string[];
  coverImageUrl?: string;
  variants: ProductDirectoryVariantSummary[];
};

export type ProductsPageData = {
  heroTitle: string;
  heroSubtitle: string;
  breadcrumbLabel: string;
  homeLabel: string;
  collectionLabel: string;
  collectionDescription: string;
  allLabel: string;
  readMoreLabel: string;
  noProductsFoundLabel: string;
  directoryTitle: string;
  directoryDescription: string;
  navSections: ProductCatalogNavSection[];
  activeSection: ProductCatalogSectionKey;
  activeValue: string | null;
  taxonomyCards: ProductTaxonomyCard[];
  customCapabilities: ProductCustomCapabilitySummary[];
  products: ProductDirectoryItem[];
};

export type ProductDetailMediaImage = {
  publicUrl: string;
  alt: string;
};

export type ProductDetailMediaVideo = {
  publicUrl: string;
  posterUrl?: string;
  title: string;
  mimeType: string;
};

export type ProductDetailVariantData = {
  code: string;
  showCode: boolean;
  optionLabel: string;
  thickness?: string;
  size?: string;
  process?: string;
  colorGroup?: string;
  faceCount?: string;
  facePatternNote?: string;
  elementImages: ProductDetailMediaImage[];
  spaceImages: ProductDetailMediaImage[];
  realImages: ProductDetailMediaImage[];
  videos: ProductDetailMediaVideo[];
};

export type ProductDetailPageLabels = {
  variantSelector: string;
  productCode: string;
  colorGroup: string;
  size: string;
  process: string;
  faceCount: string;
  facePatternNote: string;
  thickness: string;
  elementImages: string;
  spaceImages: string;
  realImages: string;
  videos: string;
  videoFallback: string;
};

export type ProductDetailPageData = {
  backLabel: string;
  requestSampleLabel: string;
  title: string;
  category: string;
  seriesTypes: string[];
  descriptionParagraphs: string[];
  defaultVariantCode: string | null;
  variants: ProductDetailVariantData[];
  labels: ProductDetailPageLabels;
};
