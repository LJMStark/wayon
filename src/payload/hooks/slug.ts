import type { CollectionBeforeValidateHook } from "payload";

import { chineseSlugify } from "../../lib/slugify.ts";

type LocalizedTitle = Partial<Record<"zh" | "en" | "es" | "ar" | "ru", string>>;

type SlugSourcePayload = {
  slug?: string | null;
  title?: LocalizedTitle | string | null;
  normalizedName?: string | null;
};

function pickSource(data: SlugSourcePayload): string {
  const title = data.title;

  if (typeof title === "string" && title) {
    return title;
  }

  if (title && typeof title === "object") {
    if (title.zh) return title.zh;
    if (data.normalizedName) return data.normalizedName;
    if (title.en) return title.en;
  }

  return data.normalizedName ?? "";
}

// Auto-populates a slug from the Chinese title (or normalizedName / English
// fallback) when the editor leaves it empty. Slugs are non-localized so the
// same value is used across all locales.
export const slugifyBeforeValidate: CollectionBeforeValidateHook = async ({
  data,
}) => {
  if (!data) return data;

  const payload = data as SlugSourcePayload;

  if (payload.slug && payload.slug.trim().length > 0) {
    return data;
  }

  const source = pickSource(payload);
  if (!source) return data;

  payload.slug = chineseSlugify(source);
  return data;
};
