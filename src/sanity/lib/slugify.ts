import { pinyin } from "pinyin-pro";

// Sanity's default slugify is ASCII-only and silently drops non-Latin
// characters, which leaves Chinese-first documents with empty slugs.
// chineseSlugify converts CJK characters to space-separated pinyin first,
// then applies the same lowercase/dash sanitation Sanity's built-in
// slugify uses, so a draft titled "意大利木纹" becomes "yi-da-li-mu-wen".
//
// Latin / digit / hyphen / underscore are passed through unchanged, so
// English-only or mixed inputs ("ZYL Stone v2") still produce sensible
// slugs ("zyl-stone-v2"). If the input has no resolvable characters at
// all, an empty string is returned and the editor fills the slug
// manually — never silently produce a colliding empty slug.

const MAX_SLUG_LENGTH = 96;

export function chineseSlugify(input: string): string {
  if (!input) {
    return "";
  }

  const transliterated = pinyin(input, {
    toneType: "none",
    type: "string",
    nonZh: "consecutive",
    separator: " ",
  });

  return transliterated
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}
