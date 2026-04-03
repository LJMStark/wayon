import { client } from '@/sanity/lib/client';
import { getProductsQuery, getProductBySlugQuery } from '@/sanity/lib/queries';
import type { AppLocale } from "@/i18n/types";

export type Product = {
  _id: string;
  title: Record<AppLocale, string>;
  slug: string;
  category: string;
  imageUrl: string;
};

export async function getProducts(): Promise<Product[]> {
  const result = await client.fetch(getProductsQuery);
  return result || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await client.fetch(getProductBySlugQuery, { slug });
  return result || null;
}

export async function getProductSlugs(): Promise<string[]> {
  const products = await getProducts();
  return products.map(p => p.slug).filter(Boolean);
}

export function getLocalizedProductValue(
  product: Product,
  locale: AppLocale,
  field: "title" | "category"
): string {
  if (!product) return "";
  if (field === "category") {
    // We could localize category names, but for now we just return the string category name
    return product.category;
  }
  // Title mapping
  return product.title?.[locale] || product.title?.['en'] || product.title?.['zh'] || "";
}

export function getProductImage(product: Product): string {
  // If we have uploaded images to Sanity, use imageUrl, else fallback to a placeholder
  return product.imageUrl || '/assets/products/placeholder.jpg';
}
