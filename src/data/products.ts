import { client } from '@/sanity/lib/client';
import {
  getProductsQuery,
  getProductBySlugQuery,
  getProductsByCategoryQuery,
  getFeaturedProductsQuery,
} from '@/sanity/lib/queries';
import type { AppLocale } from "@/i18n/types";

export type Product = {
  _id: string;
  title: Record<AppLocale, string>;
  slug: string;
  category: string;
  categorySlug: string;
  imageUrl: string;
  description?: Record<AppLocale, string>;
  thickness?: string;
  finish?: string;
  size?: string;
  featured?: boolean;
  sortOrder?: number;
};

export async function getProducts(): Promise<Product[]> {
  const result = await client.fetch(getProductsQuery);
  return result || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await client.fetch(getProductBySlugQuery, { slug });
  return result || null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const result = await client.fetch(getProductsByCategoryQuery, { categorySlug });
  return result || [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const result = await client.fetch(getFeaturedProductsQuery);
  return result || [];
}

export async function getProductSlugs(): Promise<string[]> {
  const products = await getProducts();
  return products.map(p => p.slug).filter(Boolean);
}

export function getLocalizedProductValue(
  product: Product,
  locale: AppLocale,
  field: "title" | "category" | "description"
): string {
  if (!product) return "";
  if (field === "category") {
    return product.category;
  }
  if (field === "description") {
    return product.description?.[locale] || product.description?.['en'] || product.description?.['zh'] || "";
  }
  return product.title?.[locale] || product.title?.['en'] || product.title?.['zh'] || "";
}

export function getProductImage(product: Product): string {
  return product.imageUrl || '/assets/products/placeholder.jpg';
}

