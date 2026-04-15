export const TRADE_YELLOW_PLACEHOLDER_IMAGE =
  "/assets/placeholders/trade-yellow-placeholder.svg";

export function isImportedProductFamily(input: {
  normalizedName?: string | null;
}): boolean {
  return Boolean(input.normalizedName?.trim());
}
