import { client } from '@/sanity/lib/client'
import {
  getFeaturedProductsQuery,
  getProductBySlugQuery,
  getProductsByCategoryQuery,
  getProductsDirectoryQuery,
  getProductsQuery,
} from '@/sanity/lib/queries'
import {
  selectProductCoverUrl,
  type DirectoryProduct,
  type DirectoryVariant,
} from '@/features/products/model/productDirectory'
import {
  isImportedProductFamily,
  TRADE_YELLOW_PLACEHOLDER_IMAGE,
} from '@/features/products/model/productExposure'
import type { AppLocale } from '@/i18n/types'

export type ProductMediaImage = {
  sourcePath: string
  publicUrl: string
  altZh?: string
  sortOrder?: number
}

export type ProductMediaVideo = {
  sourcePath: string
  publicUrl: string
  posterUrl?: string
  titleZh?: string
  sortOrder?: number
}

export type ProductVariant = {
  _id?: string
  code: string
  size?: string
  thickness?: string
  process?: string
  colorGroup?: string
  faceCount?: string
  facePatternNote?: string
  sortOrder?: number
  elementImages: ProductMediaImage[]
  spaceImages: ProductMediaImage[]
  realImages: ProductMediaImage[]
  videos: ProductMediaVideo[]
}

export type Product = {
  _id: string
  title: Record<AppLocale, string>
  normalizedName?: string
  slug: string
  category?: string
  categorySlug?: string
  imageUrl?: string
  description?: Record<AppLocale, string>
  thickness?: string
  finish?: string
  size?: string
  featured?: boolean
  sortOrder?: number
  coverImageUrl?: string
  coverVideoPosterUrl?: string
  seriesTypes?: string[]
  variants?: ProductVariant[]
}

export async function getProducts(): Promise<Product[]> {
  const result = await client.fetch(getProductsQuery)
  return result || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await client.fetch(getProductBySlugQuery, {slug})
  return result || null
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const result = await client.fetch(getProductsByCategoryQuery, {categorySlug})
  return result || []
}

export async function getProductsDirectory(): Promise<Product[]> {
  const result = await client.fetch(getProductsDirectoryQuery)
  return result || []
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const result = await client.fetch(getFeaturedProductsQuery)
  return result || []
}

export async function getProductSlugs(): Promise<string[]> {
  const products = await getProducts()
  return products
    .filter((product) => isImportedProductFamily(product))
    .map((product) => product.slug)
    .filter(Boolean)
}

export function getLocalizedProductValue(
  product: Product,
  locale: AppLocale,
  field: 'title' | 'category' | 'description'
): string {
  if (!product) return ''
  if (field === 'category') {
    return product.category || ''
  }
  if (field === 'description') {
    return (
      product.description?.[locale] ||
      product.description?.en ||
      product.description?.zh ||
      ''
    )
  }
  return product.title?.[locale] || product.title?.en || product.title?.zh || ''
}

function mapLegacyFinishToProcess(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return undefined
  }

  if (normalized === 'polished') {
    return '亮光'
  }

  if (normalized === 'honed') {
    return '哑光'
  }

  return value
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
    : []

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
  ]
}

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.variants && product.variants.length > 0) {
    return product.variants
  }

  return buildLegacyVariant(product)
}

export function getProductImage(product: Product): string {
  const directoryProduct: DirectoryProduct = {
    slug: product.slug,
    seriesTypes: product.seriesTypes ?? [],
    coverImageUrl: product.coverImageUrl ?? product.imageUrl ?? null,
    variants: getProductVariants(product).map<DirectoryVariant>((variant) => ({
      code: variant.code,
      size: variant.size,
      process: variant.process,
      colorGroup: variant.colorGroup,
      sortOrder: variant.sortOrder,
      elementImages: variant.elementImages,
      spaceImages: variant.spaceImages,
      realImages: variant.realImages,
      videos: variant.videos,
    })),
  }

  return selectProductCoverUrl(
    directoryProduct,
    TRADE_YELLOW_PLACEHOLDER_IMAGE
  )
}
