import { isUsableMediaUrl } from "../../features/products/lib/mediaUrls.ts";

type MediaRef = { url?: string | null } | string | null | undefined;

export type ImageMediaItem = {
  mediaRef?: MediaRef;
  publicUrl?: string | null;
};

export type VariantDoc = {
  code?: string | null;
  elementImages?: ImageMediaItem[] | null;
  realImages?: ImageMediaItem[] | null;
  sortOrder?: number | null;
  spaceImages?: ImageMediaItem[] | null;
  videos?: unknown[] | null;
};

export function readUrlFromMediaRef(value: unknown): string | null {
  if (typeof value === "string" && isLikelyUrl(value) && isUsableMediaUrl(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const url = (value as { url?: unknown }).url;
  return typeof url === "string" && isUsableMediaUrl(url) ? url : null;
}

function isLikelyUrl(value: string): boolean {
  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  );
}

function readUrlFromImageMediaItem(item: ImageMediaItem | undefined): string | null {
  if (!item) return null;

  const mediaRefUrl = readUrlFromMediaRef(item.mediaRef);
  if (mediaRefUrl) return mediaRefUrl;

  return typeof item.publicUrl === "string" && isUsableMediaUrl(item.publicUrl)
    ? item.publicUrl
    : null;
}

function countVariantMedia(variant: VariantDoc): number {
  return (
    (variant.elementImages?.length ?? 0) +
    (variant.spaceImages?.length ?? 0) +
    (variant.realImages?.length ?? 0) +
    (variant.videos?.length ?? 0)
  );
}

function pickDefaultVariant(variants: VariantDoc[]): VariantDoc | undefined {
  return [...variants].sort((left, right) => {
    const mediaDelta = countVariantMedia(right) - countVariantMedia(left);
    if (mediaDelta !== 0) return mediaDelta;

    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    return (left.code ?? "").localeCompare(right.code ?? "", "zh-Hans-CN");
  })[0];
}

function pickFirstMediaUrl(
  variants: VariantDoc[],
  field: "elementImages" | "spaceImages" | "realImages"
): string | null {
  for (const variant of variants) {
    const url = readUrlFromImageMediaItem(variant[field]?.[0]);
    if (url) return url;
  }

  return null;
}

export function pickVariantCoverUrl(variants: VariantDoc[]): string | null {
  const defaultVariant = pickDefaultVariant(variants);
  if (!defaultVariant) return null;

  const variantsByPriority = [
    defaultVariant,
    ...variants.filter((variant) => variant !== defaultVariant),
  ];

  return (
    pickFirstMediaUrl(variantsByPriority, "elementImages") ??
    pickFirstMediaUrl(variantsByPriority, "spaceImages") ??
    pickFirstMediaUrl(variantsByPriority, "realImages")
  );
}
