import type { TradeSeriesType } from "@/features/products/lib/tradeCatalog";

// The Collection mega-menu uses marketing-friendly category slugs
// (quartz, terrazzo, marble, ...) that pre-date the trade catalog import.
// The product catalog filters on TRADE_SERIES_TYPES (Chinese labels
// imported from the supplier data). These two taxonomies were originally
// independent, which left the nav links pointing at `?category=...` —
// a query the products page silently ignored.
//
// This map is the explicit bridge: nav hrefs go through
// buildCategoryProductsHref() to emit the canonical
// `?section=series&value=<series>` URL the products page understands.
//
// When a category has no corresponding series in the imported dataset,
// pick the closest visual neighbor (or fall back to "质感岩板" — the
// generic textured family). The page renders the standard "no products"
// empty state if the chosen series happens to be empty after filtering;
// that is a content gap, not a routing bug.
const NAVIGATION_CATEGORY_TO_SERIES: Readonly<Record<string, TradeSeriesType>> = {
  quartz: "质感岩板",
  terrazzo: "艺术岩板",
  "flexible-stone": "质感岩板",
  marble: "名石岩板",
  "gem-stone": "艺术岩板",
  "cement-stone": "质感岩板",
  "artificial-marble": "名石岩板",
  "porcelain-slab": "质感岩板",
  "silica-free": "质感岩板",
};

export type NavigationCategorySlug = keyof typeof NAVIGATION_CATEGORY_TO_SERIES;

const PRODUCTS_BASE_PATH = "/products";

export function getSeriesForCategory(slug: string): TradeSeriesType | null {
  return NAVIGATION_CATEGORY_TO_SERIES[slug] ?? null;
}

// Canonical href emitter for navigation links. Browsers and React's Link
// handle the encoding when rendering anchors, so the encoded form goes
// onto the wire safely.
export function buildCategoryProductsHref(slug: string): string {
  const series = getSeriesForCategory(slug);
  if (!series) {
    return PRODUCTS_BASE_PATH;
  }
  return `${PRODUCTS_BASE_PATH}?section=series&value=${encodeURIComponent(series)}`;
}

