// The active catalog tree. Trade catalog imports used to land media
// under sibling directories (most notably 视频/众岩联--实物视频/... for
// product videos), but the product page only serves files kept inside
// this subtree. Anything stored under a different prefix in Sanity is
// considered a stale reference and gets filtered out at render time.
//
// Kept as a standalone module so it can be unit-tested without dragging
// in the Sanity client + its env-var validation.

export const ACTIVE_CATALOG_PATH_PREFIX = "产品/众岩联标准素材集合/";

export function isActiveCatalogSourcePath(
  sourcePath: string | undefined
): boolean {
  if (!sourcePath) return false;
  return sourcePath.startsWith(ACTIVE_CATALOG_PATH_PREFIX);
}
