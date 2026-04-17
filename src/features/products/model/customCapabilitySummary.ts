import { getCustomCapabilityFallback } from "../content/customCapabilities.ts";
import type { ProductDirectoryItem, ProductCustomCapabilitySummary } from "../types";
import type { ProductCustomCapability } from "@/data/products";
import type { AppLocale } from "@/i18n/types";

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
          capability.title?.[locale] ||
          capability.title?.zh ||
          capability.title?.en ||
          fallback?.title ||
          capability.capabilityKey,
        description:
          capability.description?.[locale] ||
          capability.description?.zh ||
          capability.description?.en ||
          fallback?.description,
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
      title: fallback.title,
      description: fallback.description,
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
