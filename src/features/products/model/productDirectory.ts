type DirectoryMedia = {
  publicUrl: string;
  sourcePath: string;
  sortOrder?: number | null;
};

export type DirectoryVariant = {
  code: string;
  size?: string | null;
  thickness?: string | null;
  process?: string | null;
  colorGroup?: string | null;
  sortOrder?: number | null;
  elementImages: DirectoryMedia[];
  spaceImages: DirectoryMedia[];
  realImages: DirectoryMedia[];
  videos: DirectoryMedia[];
};

export type DirectoryProduct = {
  slug: string;
  seriesTypes: string[];
  coverImageUrl?: string | null;
  catalogMode?: "standard" | "custom" | null;
  customCapability?: string | null;
  variants: DirectoryVariant[];
};

export type DirectoryFilters = {
  size?: string | null;
  thickness?: string | null;
  process?: string | null;
  seriesType?: string | null;
  colorGroup?: string | null;
  catalogMode?: "standard" | "custom" | null;
  customCapability?: string | null;
};

function countVariantMedia(variant: DirectoryVariant): number {
  return (
    variant.elementImages.length +
    variant.spaceImages.length +
    variant.realImages.length +
    variant.videos.length
  );
}

function pickFirstMediaUrl(
  variants: DirectoryVariant[],
  field: "elementImages" | "spaceImages" | "realImages"
): string | null {
  for (const variant of variants) {
    const url = variant[field][0]?.publicUrl;

    if (url) {
      return url;
    }
  }

  return null;
}

export function pickDefaultVariantCode(
  variants: DirectoryVariant[]
): string | null {
  if (variants.length === 0) {
    return null;
  }

  const [selected] = [...variants].sort((left, right) => {
    const mediaDelta = countVariantMedia(right) - countVariantMedia(left);

    if (mediaDelta !== 0) {
      return mediaDelta;
    }

    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.code.localeCompare(right.code, "zh-Hans-CN");
  });

  return selected.code;
}

export function matchesDirectoryFilters(
  product: DirectoryProduct,
  filters: DirectoryFilters
): boolean {
  if (
    filters.seriesType &&
    !product.seriesTypes.includes(filters.seriesType)
  ) {
    return false;
  }

  if (filters.catalogMode && product.catalogMode !== filters.catalogMode) {
    return false;
  }

  if (
    filters.customCapability &&
    product.customCapability !== filters.customCapability
  ) {
    return false;
  }

  return product.variants.some((variant) => {
    if (filters.size && variant.size !== filters.size) {
      return false;
    }

    if (filters.thickness && variant.thickness !== filters.thickness) {
      return false;
    }

    if (filters.process && variant.process !== filters.process) {
      return false;
    }

    if (filters.colorGroup && variant.colorGroup !== filters.colorGroup) {
      return false;
    }

    return true;
  });
}

export function selectProductCoverUrl(
  product: DirectoryProduct,
  placeholderUrl: string
): string {
  if (product.coverImageUrl) {
    return product.coverImageUrl;
  }

  const defaultCode = pickDefaultVariantCode(product.variants);
  const selectedVariant =
    product.variants.find((variant) => variant.code === defaultCode) ??
    product.variants[0];

  if (!selectedVariant) {
    return placeholderUrl;
  }

  const variantsByPriority = [
    selectedVariant,
    ...product.variants.filter((variant) => variant.code !== selectedVariant.code),
  ];

  return (
    pickFirstMediaUrl(variantsByPriority, "elementImages") ??
    pickFirstMediaUrl(variantsByPriority, "spaceImages") ??
    pickFirstMediaUrl(variantsByPriority, "realImages") ??
    placeholderUrl
  );
}
