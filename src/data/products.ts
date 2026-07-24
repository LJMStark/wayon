import { unstable_cache } from "next/cache";
import {
  encodeMediaUrl,
  getPayloadClient,
  localizedString,
  mediaUrl,
  relationshipValue,
} from "@/data/_payload";
import {
  CUSTOM_CAPABILITY_CACHE_TAG,
  PRODUCT_CACHE_TAG,
} from "@/data/cacheTags";
import {
  selectProductCoverUrl,
  type DirectoryProduct,
} from "@/features/products/model/productDirectory";
import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "@/features/products/model/productExposure";
import type { AppLocale } from "@/i18n/types";
import { localizeSeriesType } from "./productAttributeLabels";
import { getLocalizedProductTitleDisplay } from "./productTitle";

export type ProductMediaImage = {
  sourcePath: string;
  publicUrl: string;
  // Payload-generated size variants (media.sizes.{card,feature}.url). Absent
  // when the source is smaller than the target (Payload skips upscaling, e.g.
  // no feature for a <1600px-wide image) or when the media is a plain
  // publicUrl with no media relation. Consumers fall back to publicUrl.
  cardUrl?: string;
  featureUrl?: string;
  altZh?: string;
  sortOrder?: number;
};

export type ProductMediaVideo = {
  sourcePath: string;
  publicUrl: string;
  posterUrl?: string;
  titleZh?: string;
  sortOrder?: number;
};

export type ProductVariant = {
  _id?: string;
  code: string;
  size?: string;
  thickness?: string;
  thicknessCustom?: string;
  process?: string;
  colorGroup?: string;
  faceCount?: string;
  facePatternNote?: string;
  sortOrder?: number;
  elementImages: ProductMediaImage[];
  spaceImages: ProductMediaImage[];
  realImages: ProductMediaImage[];
  videos: ProductMediaVideo[];
};

export type ProductCustomCapability = {
  _id: string;
  capabilityKey: string;
  title?: Record<AppLocale, string>;
  description?: Record<AppLocale, string>;
  coverImageUrl?: string;
  sortOrder?: number;
};

export type Product = {
  _id: string;
  title: Record<AppLocale, string>;
  normalizedName?: string;
  published?: boolean;
  slug: string;
  imageUrl?: string;
  description?: Record<AppLocale, string>;
  sortOrder?: number;
  coverImageUrl?: string;
  coverVideoPosterUrl?: string;
  catalogMode?: "standard" | "custom";
  customCapability?: string;
  seriesTypes?: string[];
  variants?: ProductVariant[];
};

type RawMediaSize = { url?: string | null } | null | undefined;
type RawMediaRef =
  | {
      url?: string | null;
      sizes?: { card?: RawMediaSize; feature?: RawMediaSize } | null;
    }
  | null
  | undefined;

type RawImageMedia = {
  mediaRef?: RawMediaRef;
  sourcePath?: string | null;
  publicUrl?: string | null;
  altZh?: string | null;
  sortOrder?: number | null;
};

type RawVideoMedia = {
  mediaRef?: RawMediaRef;
  sourcePath?: string | null;
  publicUrl?: string | null;
  posterUrl?: string | null;
  titleZh?: string | null;
  sortOrder?: number | null;
};

type RawProduct = {
  id: string;
  title?: unknown;
  slug?: string | null;
  normalizedName?: string | null;
  published?: boolean | null;
  image?: unknown;
  description?: unknown;
  sortOrder?: number | null;
  coverImageUrl?: string | null;
  coverVideoPosterUrl?: string | null;
  catalogMode?: "standard" | "custom" | null;
  customCapability?: unknown;
  seriesTypes?: string[] | null;
  // Variant attributes + media live directly on products (merged from the
  // former productVariants table). These are the sole source the UI reads.
  productCode?: string | null;
  size?: string | null;
  thickness?: string | null;
  thicknessCustom?: string | null;
  process?: string | null;
  colorGroup?: string | null;
  faceCount?: string | null;
  facePatternNote?: string | null;
  elementImages?: RawImageMedia[] | null;
  spaceImages?: RawImageMedia[] | null;
  realImages?: RawImageMedia[] | null;
  videos?: RawVideoMedia[] | null;
};

const PRODUCT_CACHE_SECONDS = 3600;

function mapImageMedia(value: RawImageMedia): ProductMediaImage {
  const ref = value.mediaRef;
  const cardUrl = ref?.sizes?.card?.url;
  const featureUrl = ref?.sizes?.feature?.url;
  return {
    sourcePath: value.sourcePath ?? "",
    publicUrl: encodeMediaUrl(ref?.url ?? value.publicUrl ?? ""),
    cardUrl: cardUrl ? encodeMediaUrl(cardUrl) : undefined,
    featureUrl: featureUrl ? encodeMediaUrl(featureUrl) : undefined,
    altZh: value.altZh ?? undefined,
    sortOrder: value.sortOrder ?? undefined,
  };
}

function mapVideoMedia(value: RawVideoMedia): ProductMediaVideo {
  return {
    sourcePath: value.sourcePath ?? "",
    publicUrl: encodeMediaUrl(value.mediaRef?.url ?? value.publicUrl ?? ""),
    posterUrl: value.posterUrl ? encodeMediaUrl(value.posterUrl) : undefined,
    titleZh: value.titleZh ?? undefined,
    sortOrder: value.sortOrder ?? undefined,
  };
}

// Synthesize the single variant shape the UI still consumes, sourced purely
// from the product's own columns. One product = one set of specs + media.
function mapProductSelfAsVariant(raw: RawProduct): ProductVariant {
  return {
    _id: raw.id,
    code: raw.productCode ?? (raw.slug ?? "").toUpperCase(),
    size: raw.size ?? undefined,
    thickness: raw.thickness ?? undefined,
    thicknessCustom: raw.thicknessCustom ?? undefined,
    process: raw.process ?? undefined,
    colorGroup: raw.colorGroup ?? undefined,
    faceCount: raw.faceCount ?? undefined,
    facePatternNote: raw.facePatternNote ?? undefined,
    sortOrder: undefined,
    elementImages: (raw.elementImages ?? []).map(mapImageMedia),
    spaceImages: (raw.spaceImages ?? []).map(mapImageMedia),
    realImages: (raw.realImages ?? []).map(mapImageMedia),
    videos: (raw.videos ?? []).map(mapVideoMedia),
  };
}

function mapProduct(raw: RawProduct, variants: ProductVariant[]): Product {
  const capability = relationshipValue<{ capabilityKey?: string | null }>(
    raw.customCapability
  );

  return {
    _id: raw.id,
    title: localizedString(raw.title) ?? emptyLocalized(),
    normalizedName: raw.normalizedName ?? undefined,
    published: raw.published ?? false,
    slug: raw.slug ?? "",
    imageUrl: mediaUrl(raw.image),
    description: localizedString(raw.description),
    sortOrder: raw.sortOrder ?? undefined,
    coverImageUrl: raw.coverImageUrl ? encodeMediaUrl(raw.coverImageUrl) : undefined,
    coverVideoPosterUrl: raw.coverVideoPosterUrl
      ? encodeMediaUrl(raw.coverVideoPosterUrl)
      : undefined,
    catalogMode: raw.catalogMode ?? "standard",
    customCapability: capability?.capabilityKey ?? undefined,
    seriesTypes: raw.seriesTypes ?? [],
    variants,
  };
}

function emptyLocalized(): Record<AppLocale, string> {
  return { en: "", zh: "", es: "", ar: "" };
}

function hydrateProducts(rawProducts: RawProduct[]): Product[] {
  return rawProducts.map((doc) =>
    mapProduct(doc, [mapProductSelfAsVariant(doc)])
  );
}

// The products directory (listing page + related-products) only ever reads each
// product's resolved cover image and variant *attributes* (size, thickness,
// process, colour) — never the full element/space/real image arrays or videos.
// Those heavy arrays are fetched per product by getProductBySlug on the detail
// page instead. Caching them for every product made the single directory cache
// entry overflow Next.js' 2MB data-cache limit (~2.9MB once the 4.22 catalog +
// sized-variant media landed); the oversized write was silently rejected, so
// every product page re-ran the full directory query at build time and blew the
// build up from ~10 min to 30 min+ (eventually timing out / exhausting the DB
// pool). Resolving the cover up front lets us drop the heavy media safely.
export function stripDirectoryMedia(product: Product): Product {
  const coverImageUrl = getProductImage(product);
  return {
    ...product,
    coverImageUrl,
    variants: (product.variants ?? []).map((variant) => ({
      ...variant,
      elementImages: [],
      spaceImages: [],
      realImages: [],
      videos: [],
    })),
  };
}

function hydrateDirectoryProducts(rawProducts: RawProduct[]): Product[] {
  return hydrateProducts(rawProducts).map(stripDirectoryMedia);
}

export async function getProducts(): Promise<Product[]> {
  return getCachedProducts();
}

const getCachedProducts = unstable_cache(
  async function loadPublishedProducts(): Promise<Product[]> {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "products",
      where: { published: { equals: true } },
      pagination: false,
      sort: "sortOrder",
      locale: "all",
      depth: 2,
    });
    return hydrateDirectoryProducts(docs as unknown as RawProduct[]);
  },
  ["published-products-directory"],
  {
    tags: [PRODUCT_CACHE_TAG],
    revalidate: PRODUCT_CACHE_SECONDS,
  }
);

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getCachedProductBySlug(slug);
}

// Fetch a single product (with its full element/space/real image arrays and
// videos) by slug. The detail page is the only surface that needs this heavy
// media, so it is cached per slug — each entry stays tens of KB, well under
// Next.js' 2MB data-cache limit. See stripDirectoryMedia for why the directory
// deliberately does NOT carry this media.
const getCachedProductBySlug = unstable_cache(
  async function loadProductBySlug(slug: string): Promise<Product | null> {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "products",
      where: { slug: { equals: slug }, published: { equals: true } },
      limit: 1,
      locale: "all",
      depth: 2,
    });
    const [raw] = hydrateProducts(docs as unknown as RawProduct[]);
    return raw ?? null;
  },
  ["published-product-by-slug"],
  {
    tags: [PRODUCT_CACHE_TAG],
    revalidate: PRODUCT_CACHE_SECONDS,
  }
);

export async function getProductsDirectory(): Promise<Product[]> {
  return getProducts();
}

export async function getCustomCapabilities(): Promise<ProductCustomCapability[]> {
  return getCachedCustomCapabilities();
}

const getCachedCustomCapabilities = unstable_cache(
  async function loadCustomCapabilities(): Promise<ProductCustomCapability[]> {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "customCapabilities",
      limit: 200,
      sort: "sortOrder",
      locale: "all",
      depth: 1,
    });

    return docs.map((doc) => {
      const raw = doc as {
        id: string;
        capabilityKey?: string | null;
        title?: unknown;
        description?: unknown;
        coverImage?: unknown;
        sortOrder?: number | null;
      };
      return {
        _id: raw.id,
        capabilityKey: raw.capabilityKey ?? "",
        title: localizedString(raw.title),
        description: localizedString(raw.description),
        coverImageUrl: mediaUrl(raw.coverImage),
        sortOrder: raw.sortOrder ?? undefined,
      };
    });
  },
  ["product-custom-capabilities"],
  {
    tags: [CUSTOM_CAPABILITY_CACHE_TAG],
    revalidate: PRODUCT_CACHE_SECONDS,
  }
);

export async function getProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  return getCachedProductSlugs();
}

const getCachedProductSlugs = unstable_cache(
  async function loadPublishedProductSlugs(): Promise<
    { slug: string; updatedAt: string }[]
  > {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "products",
      where: { published: { equals: true } },
      pagination: false,
      sort: "sortOrder",
      depth: 0,
    });
    return docs
      .filter((doc): doc is typeof doc & { slug: string } => {
        const slug = (doc as { slug?: string | null }).slug;
        return typeof slug === "string" && slug.length > 0;
      })
      .map((doc) => ({
        slug: (doc as { slug: string }).slug,
        updatedAt: doc.updatedAt,
      }));
  },
  ["published-product-slugs"],
  {
    tags: [PRODUCT_CACHE_TAG],
    revalidate: PRODUCT_CACHE_SECONDS,
  }
);

export function getLocalizedProductValue(
  product: Product,
  locale: AppLocale,
  field: "title" | "description"
): string {
  if (!product) return "";
  if (field === "description") {
    return localizedRecordValue(product.description, locale);
  }
  return getLocalizedProductTitleDisplay(product.title, locale, product.slug);
}

function localizedRecordValue(
  value: Record<AppLocale, string> | undefined,
  locale: AppLocale
): string {
  if (hasLocaleValue(value, locale)) {
    return value?.[locale]?.trim() ?? "";
  }

  if (isUsableLocalizedValue(value?.en, "en")) {
    return value?.en.trim() ?? "";
  }

  if (locale === "zh" && value?.zh?.trim()) {
    return value.zh.trim();
  }

  return "";
}

function hasLocaleValue(
  value: Record<AppLocale, string> | undefined,
  locale: AppLocale
): boolean {
  return isUsableLocalizedValue(value?.[locale], locale);
}

function isUsableLocalizedValue(
  value: string | undefined,
  locale: AppLocale
): boolean {
  const trimmed = value?.trim();

  if (!trimmed) {
    return false;
  }

  if (locale !== "zh" && /[\u3400-\u9fff]/.test(trimmed)) {
    return false;
  }

  return true;
}

export function getProductDisplayTitle(
  product: Product,
  locale: AppLocale
): string {
  return getLocalizedProductTitleDisplay(product.title, locale, product.slug);
}

export function getProductDisplayDescription(
  product: Product,
  locale: AppLocale
): string {
  const description = product.description;

  if (isUsableLocalizedValue(description?.[locale], locale)) {
    return description?.[locale]?.trim() ?? "";
  }

  if (isUsableLocalizedValue(description?.en, "en")) {
    return description?.en.trim() ?? "";
  }

  if (locale === "zh" && description?.zh?.trim()) {
    return description.zh.trim();
  }

  return "";
}

export function getProductDisplayCategory(
  product: Product,
  locale: AppLocale,
  fallback = ""
): string {
  const primarySeries = product.seriesTypes?.[0];
  if (primarySeries) {
    return localizeSeriesType(primarySeries, locale) ?? fallback;
  }

  return fallback;
}

export function getProductVariants(product: Product): ProductVariant[] {
  return product.variants ?? [];
}

export function getProductImage(product: Product): string {
  const directoryProduct: DirectoryProduct = {
    slug: product.slug,
    seriesTypes: product.seriesTypes ?? [],
    coverImageUrl: product.coverImageUrl ?? product.imageUrl ?? null,
    catalogMode: product.catalogMode,
    customCapability: product.customCapability ?? null,
    variants: getProductVariants(product).map((variant) => ({
      code: variant.code,
      size: variant.size,
      thickness: variant.thickness,
      process: variant.process,
      colorGroup: variant.colorGroup,
      sortOrder: variant.sortOrder,
      elementImages: variant.elementImages,
      spaceImages: variant.spaceImages,
      realImages: variant.realImages,
      videos: variant.videos,
    })),
  };

  return selectProductCoverUrl(directoryProduct, TRADE_YELLOW_PLACEHOLDER_IMAGE);
}
