export const TRADE_YELLOW_PLACEHOLDER_IMAGE =
  "/assets/fallbacks/product-fallback.jpg";

// Public-facing visibility gate. The `published` boolean on the product
// document is the single source of truth — it is independent of how the
// product was created (imported trade catalog vs. manually authored in
// Studio). Anything that gates a product on the front-end (slug listing,
// detail page metadata, detail page data) should call this function.
export function isPublishedProduct(input: {
  published?: boolean | null;
}): boolean {
  return input.published === true;
}
