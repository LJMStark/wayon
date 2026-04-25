import {
  getPayloadClient,
  localizedString,
  mediaUrl,
  relationshipValue,
} from "@/data/_payload";
import {
  selectProductCoverUrl,
  type DirectoryProduct,
  type DirectoryVariant,
} from "@/features/products/model/productDirectory";
import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "@/features/products/model/productExposure";
import type { AppLocale } from "@/i18n/types";

export type ProductMediaImage = {
  sourcePath: string;
  publicUrl: string;
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
  category?: string;
  categorySlug?: string;
  imageUrl?: string;
  description?: Record<AppLocale, string>;
  thickness?: string;
  finish?: string;
  size?: string;
  featured?: boolean;
  sortOrder?: number;
  coverImageUrl?: string;
  coverVideoPosterUrl?: string;
  catalogMode?: "standard" | "custom";
  customCapability?: string;
  seriesTypes?: string[];
  variants?: ProductVariant[];
};

type RawImageMedia = {
  sourcePath?: string | null;
  publicUrl?: string | null;
  altZh?: string | null;
  sortOrder?: number | null;
};

type RawVideoMedia = {
  sourcePath?: string | null;
  publicUrl?: string | null;
  posterUrl?: string | null;
  titleZh?: string | null;
  sortOrder?: number | null;
};

type RawVariant = {
  id: string;
  code?: string | null;
  size?: string | null;
  thickness?: string | null;
  process?: string | null;
  colorGroup?: string | null;
  faceCount?: string | null;
  facePatternNote?: string | null;
  sortOrder?: number | null;
  elementImages?: RawImageMedia[] | null;
  spaceImages?: RawImageMedia[] | null;
  realImages?: RawImageMedia[] | null;
  videos?: RawVideoMedia[] | null;
  productRef?: unknown;
};

type RawProduct = {
  id: string;
  title?: unknown;
  slug?: string | null;
  normalizedName?: string | null;
  published?: boolean | null;
  image?: unknown;
  description?: unknown;
  thickness?: string | null;
  finish?: string | null;
  size?: string | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  coverImageUrl?: string | null;
  coverVideoPosterUrl?: string | null;
  catalogMode?: "standard" | "custom" | null;
  customCapability?: unknown;
  seriesTypes?: string[] | null;
  category?: unknown;
};

function mapImageMedia(value: RawImageMedia): ProductMediaImage {
  return {
    sourcePath: value.sourcePath ?? "",
    publicUrl: value.publicUrl ?? "",
    altZh: value.altZh ?? undefined,
    sortOrder: value.sortOrder ?? undefined,
  };
}

function mapVideoMedia(value: RawVideoMedia): ProductMediaVideo {
  return {
    sourcePath: value.sourcePath ?? "",
    publicUrl: value.publicUrl ?? "",
    posterUrl: value.posterUrl ?? undefined,
    titleZh: value.titleZh ?? undefined,
    sortOrder: value.sortOrder ?? undefined,
  };
}

function mapVariant(raw: RawVariant): ProductVariant {
  return {
    _id: raw.id,
    code: raw.code ?? "",
    size: raw.size ?? undefined,
    thickness: raw.thickness ?? undefined,
    process: raw.process ?? undefined,
    colorGroup: raw.colorGroup ?? undefined,
    faceCount: raw.faceCount ?? undefined,
    facePatternNote: raw.facePatternNote ?? undefined,
    sortOrder: raw.sortOrder ?? undefined,
    elementImages: (raw.elementImages ?? []).map(mapImageMedia),
    spaceImages: (raw.spaceImages ?? []).map(mapImageMedia),
    realImages: (raw.realImages ?? []).map(mapImageMedia),
    videos: (raw.videos ?? []).map(mapVideoMedia),
  };
}

function mapProduct(raw: RawProduct, variants: ProductVariant[]): Product {
  const category = relationshipValue<{
    title?: unknown;
    slug?: string | null;
  }>(raw.category);

  const capability = relationshipValue<{ capabilityKey?: string | null }>(
    raw.customCapability
  );

  return {
    _id: raw.id,
    title: localizedString(raw.title) ?? emptyLocalized(),
    normalizedName: raw.normalizedName ?? undefined,
    published: raw.published ?? false,
    slug: raw.slug ?? "",
    category: firstLocalized(category?.title),
    categorySlug: category?.slug ?? undefined,
    imageUrl: mediaUrl(raw.image),
    description: localizedString(raw.description),
    thickness: raw.thickness ?? undefined,
    finish: raw.finish ?? undefined,
    size: raw.size ?? undefined,
    featured: raw.featured ?? false,
    sortOrder: raw.sortOrder ?? undefined,
    coverImageUrl: raw.coverImageUrl ?? undefined,
    coverVideoPosterUrl: raw.coverVideoPosterUrl ?? undefined,
    catalogMode: raw.catalogMode ?? "standard",
    customCapability: capability?.capabilityKey ?? undefined,
    seriesTypes: raw.seriesTypes ?? [],
    variants,
  };
}

function emptyLocalized(): Record<AppLocale, string> {
  return { en: "", zh: "", es: "", ar: "" };
}

function firstLocalized(value: unknown): string | undefined {
  const localized = localizedString(value);
  if (!localized) return undefined;
  return (
    localized.zh || localized.en || localized.es || localized.ar
  );
}

async function loadVariantsByProductIds(
  productIds: string[]
): Promise<Map<string, ProductVariant[]>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "productVariants",
    where: { productRef: { in: productIds } },
    limit: 5000,
    sort: "sortOrder",
    depth: 0,
  });

  const map = new Map<string, ProductVariant[]>();
  for (const doc of docs as unknown as RawVariant[]) {
    const productId =
      typeof doc.productRef === "string"
        ? doc.productRef
        : typeof doc.productRef === "number"
          ? String(doc.productRef)
          : ((doc.productRef as { id?: string | number })?.id != null
              ? String((doc.productRef as { id: string | number }).id)
              : "");
    if (!productId) continue;
    const list = map.get(productId) ?? [];
    list.push(mapVariant(doc));
    map.set(productId, list);
  }

  for (const list of map.values()) {
    list.sort((left, right) => {
      const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.code.localeCompare(right.code, "zh-Hans-CN");
    });
  }

  return map;
}

async function hydrateProducts(rawProducts: RawProduct[]): Promise<Product[]> {
  const variantMap = await loadVariantsByProductIds(
    rawProducts.map((doc) => doc.id)
  );
  return rawProducts.map((doc) => mapProduct(doc, variantMap.get(doc.id) ?? []));
}

export async function getProducts(): Promise<Product[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    limit: 1000,
    sort: "sortOrder",
    locale: "all",
    depth: 2,
  });
  return hydrateProducts(docs as unknown as RawProduct[]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: {
      and: [{ slug: { equals: slug } }, { published: { equals: true } }],
    },
    limit: 1,
    locale: "all",
    depth: 2,
  });
  const [first] = docs;
  if (!first) return null;
  const [hydrated] = await hydrateProducts([first as unknown as RawProduct]);
  return hydrated ?? null;
}

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: {
      and: [
        { published: { equals: true } },
        { "category.slug": { equals: categorySlug } },
      ],
    },
    limit: 1000,
    sort: "sortOrder",
    locale: "all",
    depth: 2,
  });
  return hydrateProducts(docs as unknown as RawProduct[]);
}

export async function getProductsDirectory(): Promise<Product[]> {
  return getProducts();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: {
      and: [{ featured: { equals: true } }, { published: { equals: true } }],
    },
    limit: 50,
    sort: "sortOrder",
    locale: "all",
    depth: 2,
  });
  return hydrateProducts(docs as unknown as RawProduct[]);
}

export async function getCustomCapabilities(): Promise<ProductCustomCapability[]> {
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
}

export async function getProductSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    limit: 1000,
    sort: "sortOrder",
    depth: 0,
  });
  return docs
    .map((doc) => (doc as { slug?: string | null }).slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
}

export function getLocalizedProductValue(
  product: Product,
  locale: AppLocale,
  field: "title" | "category" | "description"
): string {
  if (!product) return "";
  if (field === "category") {
    return product.category || "";
  }
  if (field === "description") {
    return (
      product.description?.[locale] ||
      product.description?.en ||
      product.description?.zh ||
      ""
    );
  }
  return product.title?.[locale] || product.title?.en || product.title?.zh || "";
}

function mapLegacyFinishToProcess(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized === "polished") {
    return "亮光";
  }

  if (normalized === "honed") {
    return "哑光";
  }

  return value;
}

function buildLegacyVariant(product: Product): ProductVariant[] {
  const legacyImage = product.imageUrl
    ? [
        {
          sourcePath: product.imageUrl,
          publicUrl: product.imageUrl,
          altZh: product.title?.zh,
          sortOrder: 0,
        },
      ]
    : [];

  return [
    {
      code: product.slug,
      size: product.size,
      thickness: product.thickness,
      process: mapLegacyFinishToProcess(product.finish),
      sortOrder: 0,
      colorGroup: undefined,
      faceCount: undefined,
      facePatternNote: undefined,
      elementImages: [],
      spaceImages: legacyImage,
      realImages: [],
      videos: [],
    },
  ];
}

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.variants && product.variants.length > 0) {
    return product.variants;
  }

  return buildLegacyVariant(product);
}

export function getProductImage(product: Product): string {
  const directoryProduct: DirectoryProduct = {
    slug: product.slug,
    seriesTypes: product.seriesTypes ?? [],
    coverImageUrl: product.coverImageUrl ?? product.imageUrl ?? null,
    catalogMode: product.catalogMode,
    customCapability: product.customCapability ?? null,
    variants: getProductVariants(product).map<DirectoryVariant>((variant) => ({
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
