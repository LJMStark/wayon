import { getSeriesForCategory } from "@/data/navigationCategoryMap";

import {
  CATALOG_URL_SECTION_KEYS,
  resolveCatalogUrlSelection,
  type CatalogUrlResolution,
} from "./catalogUrl";

export type ProductsPageSearchParams = {
  [key: string]: string | string[] | undefined;
  section?: string | string[];
  value?: string | string[];
  size?: string | string[];
  series?: string | string[];
  thickness?: string | string[];
  color?: string | string[];
  process?: string | string[];
  custom?: string | string[];
  // Legacy alias from the previous CMS.
  category?: string | string[];
  // Free-text keyword from the Header search form.
  q?: string | string[];
};

export type ResolvedProductsPageSearchParams = CatalogUrlResolution & {
  searchParams: ProductsPageSearchParams;
};

export type ProductsCatalogRequestResolution =
  | { type: "pass" }
  | { type: "notFound" }
  | { type: "redirect"; location: string };

const PRODUCTS_CATALOG_PATH = /^\/(?:(?:en|zh|es|ar)\/)?products\/?$/u;

function readSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function hasExplicitCatalogScope(params: ProductsPageSearchParams): boolean {
  return (
    params.section !== undefined ||
    params.value !== undefined ||
    CATALOG_URL_SECTION_KEYS.some(
      (section) => params[section] !== undefined
    )
  );
}

function applyLegacyCategoryAlias(
  params: ProductsPageSearchParams
): ProductsPageSearchParams {
  if (hasExplicitCatalogScope(params)) {
    return params;
  }

  const categorySlug = readSingleParam(params.category);
  if (!categorySlug) {
    return params;
  }

  const series = getSeriesForCategory(categorySlug);
  if (!series) {
    return params;
  }

  return { ...params, category: undefined, section: "series", value: series };
}

export function toProductsPageSearchParams(
  searchParams: URLSearchParams
): ProductsPageSearchParams {
  const output: ProductsPageSearchParams = {};

  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    output[key] = values.length > 1 ? values : values[0];
  }

  return output;
}

export function resolveProductsPageSearchParams(
  searchParams: ProductsPageSearchParams,
  basePath = "/products"
): ResolvedProductsPageSearchParams {
  const categoryParam = searchParams.category;
  const hasLegacyCategory = categoryParam !== undefined;
  const legacyCategory = readSingleParam(categoryParam);
  const hasExplicitScope = hasExplicitCatalogScope(searchParams);

  if (
    Array.isArray(categoryParam) ||
    (hasLegacyCategory && (!legacyCategory || hasExplicitScope))
  ) {
    return {
      invalid: true,
      redirectHref: null,
      searchParams,
    };
  }

  if (legacyCategory && !getSeriesForCategory(legacyCategory)) {
    return {
      invalid: true,
      redirectHref: null,
      searchParams,
    };
  }

  const resolvedParams = applyLegacyCategoryAlias(searchParams);
  const resolution = resolveCatalogUrlSelection(resolvedParams, basePath);

  return {
    ...resolution,
    searchParams: {
      ...resolvedParams,
      section: resolution.section,
      value: resolution.value,
    },
  };
}

export function resolveProductsCatalogRequest(
  method: string,
  requestUrl: string
): ProductsCatalogRequestResolution {
  const url = new URL(requestUrl);
  const isPageRequest = method === "GET" || method === "HEAD";

  if (!isPageRequest || !PRODUCTS_CATALOG_PATH.test(url.pathname)) {
    return { type: "pass" };
  }

  const resolution = resolveProductsPageSearchParams(
    toProductsPageSearchParams(url.searchParams),
    url.pathname.replace(/\/$/u, "") || "/products"
  );

  if (resolution.invalid) {
    return { type: "notFound" };
  }

  if (resolution.redirectHref) {
    return {
      type: "redirect",
      location: new URL(resolution.redirectHref, url).toString(),
    };
  }

  return { type: "pass" };
}
