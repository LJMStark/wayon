import { groq } from 'next-sanity'

const imageMediaProjection = `
{
  sourcePath,
  publicUrl,
  altZh,
  sortOrder
}
`

const videoMediaProjection = `
{
  sourcePath,
  publicUrl,
  posterUrl,
  titleZh,
  sortOrder
}
`

const productVariantProjection = `
{
  _id,
  code,
  size,
  thickness,
  process,
  colorGroup,
  faceCount,
  facePatternNote,
  sortOrder,
  "elementImages": coalesce(elementImages, [])[]${imageMediaProjection},
  "spaceImages": coalesce(spaceImages, [])[]${imageMediaProjection},
  "realImages": coalesce(realImages, [])[]${imageMediaProjection},
  "videos": coalesce(videos, [])[]${videoMediaProjection}
}
`

const productProjection = `
{
  _id,
  title,
  normalizedName,
  "published": coalesce(published, false),
  "slug": slug.current,
  "category": category->title,
  "categorySlug": category->slug.current,
  "imageUrl": image.asset->url,
  description,
  thickness,
  finish,
  size,
  featured,
  sortOrder,
  coverImageUrl,
  coverVideoPosterUrl,
  "catalogMode": coalesce(catalogMode, "standard"),
  "customCapability": customCapability->capabilityKey,
  "seriesTypes": coalesce(seriesTypes, []),
  "variants": *[_type == "productVariant" && references(^._id)] | order(coalesce(sortOrder, 999999) asc, code asc) ${productVariantProjection}
}
`

export const getProductsQuery = groq`*[_type == "product"] | order(coalesce(sortOrder, 999999) asc, title.zh asc) ${productProjection}`

export const getProductSlugsQuery = groq`*[_type == "product" && published == true] | order(coalesce(sortOrder, 999999) asc, title.zh asc) {
  normalizedName,
  "slug": slug.current
}`

export const getFeaturedProductsQuery = groq`*[_type == "product" && featured == true] | order(coalesce(sortOrder, 999999) asc) ${productProjection}`

export const getProductBySlugQuery = groq`*[_type == "product" && slug.current == $slug][0] ${productProjection}`

export const getProductsByCategoryQuery = groq`*[_type == "product" && category->slug.current == $categorySlug] | order(coalesce(sortOrder, 999999) asc) ${productProjection}`

export const getProductsDirectoryQuery = groq`*[_type == "product" && published == true] | order(coalesce(sortOrder, 999999) asc, title.zh asc) {
  _id,
  title,
  normalizedName,
  "slug": slug.current,
  "category": category->title,
  "categorySlug": category->slug.current,
  "imageUrl": image.asset->url,
  coverImageUrl,
  coverVideoPosterUrl,
  "catalogMode": coalesce(catalogMode, "standard"),
  "customCapability": customCapability->capabilityKey,
  "seriesTypes": coalesce(seriesTypes, []),
  sortOrder,
  "variants": *[_type == "productVariant" && references(^._id)] | order(coalesce(sortOrder, 999999) asc, code asc) ${productVariantProjection}
}`

export const getCustomCapabilitiesQuery = groq`*[_type == "customCapability"] | order(coalesce(sortOrder, 999999) asc, capabilityKey asc) {
  _id,
  capabilityKey,
  title,
  description,
  "coverImageUrl": coverImage.asset->url,
  sortOrder
}`

export const getCategoriesQuery = groq`*[_type == "category"] | order(sortOrder asc) {
  _id,
  title,
  localizedTitle,
  "slug": slug.current,
  description,
  localizedDescription,
  "coverImageUrl": coverImage.asset->url,
  sortOrder
}`

export const getNewsQuery = groq`*[_type == "news"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  "imageUrl": coverImage.asset->url,
  excerpt,
  category
}`

export const getNewsBySlugQuery = groq`*[_type == "news" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  "imageUrl": coverImage.asset->url,
  excerpt,
  category,
  body
}`
