import type { CollectionBeforeChangeHook } from "payload";

import type { AppLocale } from "../../i18n/types.ts";

import {
  TRANSLATION_META_FIELD_NAME,
  clearTranslationMetaEntry,
  readTranslationMeta,
  type TranslationMeta,
} from "../fields/translationMeta.ts";

const APP_LOCALES: AppLocale[] = ["en", "zh", "es", "ar"];

type Options = {
  localizedFields: string[];
};

// When the translate endpoint writes a localized value, it sets
// req.context.fromTranslator = true so this hook keeps the autoTranslated
// flag intact. Any other write (operator typing in the admin form, REST API
// patch, import script) is treated as a manual override and clears the flag
// for whichever (field, locale) actually changed value.
export function clearAutoTranslatedFlagsBeforeChange({
  localizedFields,
}: Options): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req }) => {
    if (!data) return data;
    const fromTranslator = (req?.context as Record<string, unknown> | undefined)
      ?.fromTranslator;
    if (fromTranslator === true) return data;

    const incomingMeta = readTranslationMeta(
      (data as Record<string, unknown>)[TRANSLATION_META_FIELD_NAME]
    );
    const previousMeta = readTranslationMeta(
      (originalDoc as Record<string, unknown> | undefined)?.[
        TRANSLATION_META_FIELD_NAME
      ]
    );

    let nextMeta: TranslationMeta = incomingMeta;
    let mutated = false;

    const reqLocale = (req as { locale?: string } | undefined)?.locale;

    for (const field of localizedFields) {
      const incomingValue = (data as Record<string, unknown>)[field];
      const previousValue = (originalDoc as Record<string, unknown> | undefined)?.[
        field
      ];

      // Payload single-locale write: data[field] is the unwrapped value for
      // req.locale, and originalDoc[field] mirrors that. We only know the
      // locale that's being changed.
      if (
        typeof reqLocale === "string" &&
        APP_LOCALES.includes(reqLocale as AppLocale)
      ) {
        if (
          fieldValueDiffers(incomingValue, previousValue) &&
          previousMeta[field]?.[reqLocale as AppLocale]?.autoTranslated
        ) {
          nextMeta = clearTranslationMetaEntry(
            nextMeta,
            field,
            reqLocale as AppLocale
          );
          mutated = true;
        }
        continue;
      }

      // Payload locale=all write: data[field] is a record keyed by locale.
      if (
        incomingValue &&
        typeof incomingValue === "object" &&
        !Array.isArray(incomingValue)
      ) {
        const incomingRecord = incomingValue as Record<string, unknown>;
        const previousRecord =
          previousValue && typeof previousValue === "object"
            ? (previousValue as Record<string, unknown>)
            : {};
        for (const locale of APP_LOCALES) {
          if (
            fieldValueDiffers(incomingRecord[locale], previousRecord[locale]) &&
            previousMeta[field]?.[locale]?.autoTranslated
          ) {
            nextMeta = clearTranslationMetaEntry(nextMeta, field, locale);
            mutated = true;
          }
        }
      }
    }

    if (mutated) {
      (data as Record<string, unknown>)[TRANSLATION_META_FIELD_NAME] = nextMeta;
    }

    return data;
  };
}

function fieldValueDiffers(a: unknown, b: unknown): boolean {
  if (a === b) return false;
  if (a == null && b == null) return false;
  // Cheap structural compare: JSON serialization is fine here because the
  // fields under inspection are primitive strings or Lexical JSON trees.
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch {
    return true;
  }
}
