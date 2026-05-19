import { createRequire } from "node:module";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

type SiteCacheTag = "news" | "products" | "custom-capabilities";
type RevalidateTag = (tag: string, profile?: string | { expire?: number }) => void;

const require = createRequire(import.meta.url);
const { revalidateTag } = require("next/cache") as {
  revalidateTag: RevalidateTag;
};
const warnedTags = new Set<string>();

function revalidateSiteCacheTags(tags: SiteCacheTag[]): void {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch (error) {
      if (warnedTags.has(tag)) {
        continue;
      }
      warnedTags.add(tag);
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipped cache revalidation for "${tag}": ${message}`);
    }
  }
}

export function revalidateSiteCacheAfterChange(
  tags: SiteCacheTag[]
): CollectionAfterChangeHook {
  return ({ doc }) => {
    revalidateSiteCacheTags(tags);
    return doc;
  };
}

export function revalidateSiteCacheAfterDelete(
  tags: SiteCacheTag[]
): CollectionAfterDeleteHook {
  return ({ doc }) => {
    revalidateSiteCacheTags(tags);
    return doc;
  };
}
