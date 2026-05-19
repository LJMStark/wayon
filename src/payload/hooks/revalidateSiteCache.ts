import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

type SiteCacheTag = "news" | "products" | "custom-capabilities";

function revalidateSiteCacheTags(tags: SiteCacheTag[]): void {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
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
