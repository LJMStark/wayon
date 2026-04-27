import {
  getCustomCapabilityFallback,
  getLocalizedCapabilityDescription,
  getLocalizedCapabilityTitle,
} from "../content/customCapabilities.ts";
import type { ProductDirectoryItem, ProductCustomCapabilitySummary } from "../types";
import type { ProductCustomCapability } from "@/data/products";
import type { AppLocale } from "@/i18n/types";

function pickLocalizedCmsValue(
  values: Record<AppLocale, string> | undefined,
  locale: AppLocale
): string | undefined {
  const localeValue = values?.[locale]?.trim();

  if (localeValue) {
    return localeValue;
  }

  const englishValue = values?.en?.trim();

  if (englishValue) {
    return englishValue;
  }

  if (locale === "zh") {
    return values?.zh?.trim() || undefined;
  }

  return undefined;
}

export function buildCustomCapabilitySummaries(
  capabilities: ProductCustomCapability[],
  products: ProductDirectoryItem[],
  locale: AppLocale
): ProductCustomCapabilitySummary[] {
  const productCounts = new Map<string, number>();

  for (const product of products) {
    if (!product.customCapability) {
      continue;
    }

    productCounts.set(
      product.customCapability,
      (productCounts.get(product.customCapability) ?? 0) + 1
    );
  }

  const configuredKeys = new Set<string>();
  const summaries: ProductCustomCapabilitySummary[] = capabilities.map(
    (capability) => {
      configuredKeys.add(capability.capabilityKey);
      const fallback = getCustomCapabilityFallback(capability.capabilityKey);

      return {
        key: capability.capabilityKey,
        title:
          pickLocalizedCmsValue(capability.title, locale) ||
          (fallback ? getLocalizedCapabilityTitle(fallback, locale) : undefined) ||
          capability.capabilityKey,
        description:
          pickLocalizedCmsValue(capability.description, locale) ||
          (fallback
            ? getLocalizedCapabilityDescription(fallback, locale)
            : undefined),
        imageSrc: capability.coverImageUrl,
        sortOrder: capability.sortOrder ?? 0,
        count: productCounts.get(capability.capabilityKey) ?? 0,
      };
    }
  );

  for (const [capabilityKey, count] of productCounts.entries()) {
    if (configuredKeys.has(capabilityKey)) {
      continue;
    }

    const fallback = getCustomCapabilityFallback(capabilityKey);

    if (!fallback) {
      continue;
    }

    summaries.push({
      key: capabilityKey,
      title: getLocalizedCapabilityTitle(fallback, locale),
      description: getLocalizedCapabilityDescription(fallback, locale),
      sortOrder: Number.MAX_SAFE_INTEGER,
      count,
    });
  }

  return summaries.sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.key.localeCompare(right.key, "zh-Hans-CN");
  });
}
