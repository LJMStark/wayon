import { createHash } from "node:crypto";

function hashValue(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 10);
}

function sanitizeIdSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-");
}

export function buildStableTradeFamilyKey(normalizedName: string): string {
  return hashValue(normalizedName.trim());
}

export function buildStableTradeFamilySlug(normalizedName: string): string {
  const asciiSlug = normalizedName
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (asciiSlug) {
    return asciiSlug;
  }

  return `trade-${buildStableTradeFamilyKey(normalizedName)}`;
}

export function buildStableTradeProductId(familyKey: string): string {
  return `product-family-${sanitizeIdSegment(familyKey)}`;
}

export function buildStableTradeVariantId(
  familyKey: string,
  code: string
): string {
  return `product-variant-${sanitizeIdSegment(familyKey)}-${sanitizeIdSegment(code)}`;
}
