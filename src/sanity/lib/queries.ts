import { groq } from 'next-sanity'

export const getProductsQuery = groq`*[_type == "product"] | order(sortOrder asc) {
  _id,
  title,
  "slug": slug.current,
  "category": category->title,
  "categorySlug": category->slug.current,
  "imageUrl": image.asset->url,
  description,
  thickness,
  finish,
  size,
  featured,
  sortOrder
}`

export const getFeaturedProductsQuery = groq`*[_type == "product" && featured == true] | order(sortOrder asc) {
  _id,
  title,
  "slug": slug.current,
  "category": category->title,
  "imageUrl": image.asset->url
}`

export const getProductBySlugQuery = groq`*[_type == "product" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  "category": category->title,
  "categorySlug": category->slug.current,
  "imageUrl": image.asset->url,
  description,
  thickness,
  finish,
  size
}`

export const getProductsByCategoryQuery = groq`*[_type == "product" && category->slug.current == $categorySlug] | order(sortOrder asc) {
  _id,
  title,
  "slug": slug.current,
  "category": category->title,
  "imageUrl": image.asset->url
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
