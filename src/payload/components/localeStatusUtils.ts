import type { AppLocale } from "@/i18n/types";

export const LOCALES: AppLocale[] = ["zh", "en", "es", "ar"];

export const LOCALE_LABEL: Record<AppLocale, string> = {
  zh: "中文",
  en: "English",
  es: "Español",
  ar: "العربية",
};

// Each entry lists the localized fields whose presence determines whether a
// locale is "complete enough" to publish. Keep this in sync with the public
// site's expectations — a news article with title but no body would render as
// an empty page, so news requires both.
export const REQUIRED_LOCALIZED_FIELDS: Record<string, string[]> = {
  news: ["title", "body"],
  products: ["title"],
};

// Collections with versions.drafts enabled need `draft=true` on REST reads, or
// the admin sees the published version instead of the operator's in-progress
// edit. Mirror the `versions.drafts` flag in each collection config.
export const COLLECTIONS_WITH_DRAFTS: Record<string, boolean> = {
  news: true,
};

export function buildLocaleAllFetchUrl(
  collection: string,
  id: string
): string {
  const draftParam = COLLECTIONS_WITH_DRAFTS[collection] ? "&draft=true" : "";
  return `/api/${collection}/${encodeURIComponent(id)}?locale=all&depth=0${draftParam}`;
}

export function readLocaleValue(field: unknown, locale: AppLocale): unknown {
  if (!field) return undefined;
  if (typeof field !== "object" || Array.isArray(field)) return field;
  return (field as Record<string, unknown>)[locale];
}

const CJK_TEXT_PATTERN = /[㐀-鿿]/u;

function isUsableLocalizedText(value: string, locale: AppLocale): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  // Mirror the public site's CJK guards (news-view.ts, productCatalog.ts,
  // getProductsPageData.ts): non-Chinese locales containing CJK characters are
  // treated as unusable because the frontend falls back to English or pinyin
  // anyway. If we accepted CJK here, the admin badge would say "filled" while
  // visitors actually see the fallback content — exactly the bug we're guarding
  // against.
  if (locale !== "zh" && CJK_TEXT_PATTERN.test(trimmed)) return false;
  return true;
}

// Returns true only when the value carries real, user-visible content for the
// given locale. Handles plain strings and Lexical SerializedEditorState trees.
// For Lexical, recursively scans descendant nodes for any text node with
// non-whitespace, non-CJK-in-non-zh text.
export function hasLocalizedContent(
  value: unknown,
  locale: AppLocale
): boolean {
  if (value == null) return false;
  if (typeof value === "string") return isUsableLocalizedText(value, locale);
  if (typeof value !== "object") return false;

  const root = (value as { root?: { children?: unknown[] } }).root;
  if (root && Array.isArray(root.children)) {
    return containsLexicalText(root.children, locale);
  }

  return false;
}

function containsLexicalText(nodes: unknown[], locale: AppLocale): boolean {
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const text = (node as { text?: unknown }).text;
    if (typeof text === "string" && isUsableLocalizedText(text, locale)) {
      return true;
    }
    const children = (node as { children?: unknown[] }).children;
    if (Array.isArray(children) && containsLexicalText(children, locale)) {
      return true;
    }
  }
  return false;
}

export type LocaleStatusMap = Record<AppLocale, boolean>;

// Returns a per-locale boolean indicating whether ALL required fields for the
// collection are populated in that locale. Used by both the list-view cell
// and the edit-page warning so they stay in lockstep.
export function computeLocaleStatus(
  doc: Record<string, unknown>,
  collection: string
): LocaleStatusMap {
  const result: LocaleStatusMap = { zh: false, en: false, es: false, ar: false };
  const requiredFields = REQUIRED_LOCALIZED_FIELDS[collection];
  if (!requiredFields) return result;

  for (const locale of LOCALES) {
    result[locale] = requiredFields.every((field) =>
      hasLocalizedContent(readLocaleValue(doc[field], locale), locale)
    );
  }
  return result;
}

export function localesMissing(
  doc: Record<string, unknown>,
  collection: string
): AppLocale[] {
  const status = computeLocaleStatus(doc, collection);
  return LOCALES.filter((locale) => !status[locale]);
}
