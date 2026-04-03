import { groq } from 'next-sanity'

export const getProductsQuery = groq`*[_type == "product"] {
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
  "imageUrl": image.asset->url
}`

// For getting categories
export const getCategoriesQuery = groq`*[_type == "category"] {
  _id,
  title,
  "slug": slug.current
}`

// For getting news
export const getNewsQuery = groq`*[_type == "news"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  "imageUrl": coverImage.asset->url,
  excerpt
}`
