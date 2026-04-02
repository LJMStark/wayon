import rawProducts from "./products.json";

import type { AppLocale } from "@/i18n/types";

export type ProductLocalizedField = `title_${AppLocale}` | `category_${AppLocale}`;

export type Product = {
  title: string;
  category: string;
  url: string;
  imageSrc: string;
  localImage?: string;
} & Partial<Record<ProductLocalizedField, string>>;

const PRODUCT_LOCALE_FIELDS: Record<
  AppLocale,
  { title: ProductLocalizedField; category: ProductLocalizedField }
> = {
  en: { title: "title_en", category: "category_en" },
  zh: { title: "title_zh", category: "category_zh" },
  es: { title: "title_es", category: "category_es" },
  ar: { title: "title_ar", category: "category_ar" },
  ru: { title: "title_ru", category: "category_ru" },
};

export const PRODUCTS: Product[] = rawProducts as Product[];

export function getProductSlug(url: string): string {
  return url.split("/").pop()?.replace(".html", "") ?? "";
}

export function getProductImage(product: Product): string {
  return product.localImage ?? product.imageSrc;
}

export function getLocalizedProductValue(
  product: Product,
  locale: AppLocale,
  field: "title" | "category"
): string {
  const localizedKey = PRODUCT_LOCALE_FIELDS[locale][field];

  return product[localizedKey] ?? product[field];
}

export function getProductSlugs(): string[] {
  return PRODUCTS.map((product) => getProductSlug(product.url)).filter(Boolean);
}

export function findProductBySlug(slug: string): Product | undefined {
  const normalizedSlug = slug.toLowerCase();

  return PRODUCTS.find((product) => {
    const productSlug = getProductSlug(product.url).toLowerCase();

    return productSlug === normalizedSlug || product.url.toLowerCase().includes(normalizedSlug);
  });
}
