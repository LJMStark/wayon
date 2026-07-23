import type { TradeSeriesType } from "../features/products/lib/tradeCatalog";
import { buildCatalogHref } from "../features/products/model/catalogUrl";

// The Collection mega-menu uses marketing-friendly category slugs
// (quartz, terrazzo, marble, ...) that pre-date the trade catalog import.
// The product catalog filters on TRADE_SERIES_TYPES (Chinese labels
// imported from the supplier data). These two taxonomies were originally
// independent, which left the nav links pointing at `?category=...` —
// a query the products page silently ignored.
//
// This map is the explicit bridge: nav hrefs use a stable ASCII identifier
// while the products page maps it back to the stored supplier value.
//
// When a category has no corresponding series in the imported dataset,
// pick the closest visual neighbor (or fall back to "质感岩板" — the
// generic textured family). The page renders the standard "no products"
// empty state if the chosen series happens to be empty after filtering;
// that is a content gap, not a routing bug.
const NAVIGATION_CATEGORY_TO_SERIES = {
  quartz: "质感岩板",
  terrazzo: "艺术岩板",
  "flexible-stone": "质感岩板",
  marble: "名石岩板",
  "gem-stone": "艺术岩板",
  "cement-stone": "质感岩板",
  "artificial-marble": "名石岩板",
  "porcelain-slab": "质感岩板",
  "silica-free": "质感岩板",
} as const satisfies Readonly<Record<string, TradeSeriesType>>;

export type NavigationCategorySlug = keyof typeof NAVIGATION_CATEGORY_TO_SERIES;

const PRODUCTS_BASE_PATH = "/products";

const LEGACY_PRODUCT_CATEGORY_PATHS = [
  { source: "/products/quartz", category: "quartz" },
  { source: "/products/terrazzo", category: "terrazzo" },
  { source: "/products/flexible-stone", category: "flexible-stone" },
  { source: "/products/marble", category: "marble" },
  { source: "/products/gem-stone", category: "gem-stone" },
  { source: "/products/silica-free", category: "silica-free" },
  { source: "/products/quartz.html", category: "quartz" },
  {
    source: "/products/flexible-stone.html",
    category: "flexible-stone",
  },
] as const satisfies ReadonlyArray<{
  source: string;
  category: NavigationCategorySlug;
}>;

export function getSeriesForCategory(slug: string): TradeSeriesType | null {
  if (!(slug in NAVIGATION_CATEGORY_TO_SERIES)) {
    return null;
  }

  return NAVIGATION_CATEGORY_TO_SERIES[slug as NavigationCategorySlug];
}

export function buildCategoryProductsHref(slug: string): string {
  const series = getSeriesForCategory(slug);
  if (!series) {
    return PRODUCTS_BASE_PATH;
  }
  return buildCatalogHref("series", series, PRODUCTS_BASE_PATH);
}

export function buildLegacyProductCategoryRedirects(): Array<{
  source: string;
  destination: string;
}> {
  return LEGACY_PRODUCT_CATEGORY_PATHS.map(({ source, category }) => ({
    source,
    destination: buildCategoryProductsHref(category),
  }));
}
