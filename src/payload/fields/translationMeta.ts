import type { Field } from "payload";

import type { AppLocale } from "../../i18n/types.ts";

// Per-collection, per-doc record of which localized field/locale values were
// produced by the admin "Translate from Chinese" tool. Shape:
//   {
//     [fieldName]: {
//       [locale]: { autoTranslated: boolean, translatedAt: string, model: string }
//     }
//   }
// The TranslationBadge component reads this to show "AI translated" hints in
// the admin. The public frontend never reads this column.
export type TranslationMetaEntry = {
  autoTranslated: boolean;
  translatedAt: string;
  model: string;
};

export type TranslationMeta = Partial<
  Record<string, Partial<Record<AppLocale, TranslationMetaEntry>>>
>;

export const TRANSLATION_META_FIELD_NAME = "translationMeta";

export const translationMetaField: Field = {
  name: TRANSLATION_META_FIELD_NAME,
  type: "json",
  label: "翻译元数据",
  admin: {
    hidden: true,
    description:
      "记录哪些字段是 AI 从中文翻译来的。后台用来显示「AI 翻译」徽章，前端不读。",
  },
  access: {
    // Operator-internal metadata. Hide from anonymous REST callers so
    // /api/news and /api/products responses don't expose which fields
    // were machine-translated. Authenticated CMS users still see it.
    read: ({ req }) => Boolean(req.user),
  },
};

export function readTranslationMeta(value: unknown): TranslationMeta {
  if (!value || typeof value !== "object") return {};
  return value as TranslationMeta;
}

export function setTranslationMetaEntry(
  meta: TranslationMeta,
  field: string,
  locale: AppLocale,
  entry: TranslationMetaEntry
): TranslationMeta {
  const fieldMeta = { ...(meta[field] ?? {}) };
  fieldMeta[locale] = entry;
  return {
    ...meta,
    [field]: fieldMeta,
  };
}

export function clearTranslationMetaEntry(
  meta: TranslationMeta,
  field: string,
  locale: AppLocale
): TranslationMeta {
  const fieldMeta = { ...(meta[field] ?? {}) };
  if (!fieldMeta[locale]) return meta;
  delete fieldMeta[locale];
  return {
    ...meta,
    [field]: fieldMeta,
  };
}
