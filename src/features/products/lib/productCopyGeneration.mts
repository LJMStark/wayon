import type { AppLocale } from "@/i18n/types";

export const PRODUCT_COPY_LOCALES: AppLocale[] = ["zh", "en", "es", "ar"];

export type ProductCopyDescription = Record<AppLocale, string>;

export type ProductCopyDraft = {
  description: ProductCopyDescription;
  sources: Array<{ title: string; url: string }>;
  warnings: string[];
};

export type ProductCopyValidationResult =
  | { ok: true; draft: ProductCopyDraft }
  | { ok: false; errors: string[] };

export function hasAnyLocalizedDescription(
  description: Partial<Record<AppLocale, string>> | null | undefined
): boolean {
  return PRODUCT_COPY_LOCALES.some((locale) => {
    const value = description?.[locale];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function validateProductCopyDraft(
  value: unknown
): ProductCopyValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== "object") {
    return { ok: false, errors: ["Draft is not an object."] };
  }

  const record = value as Record<string, unknown>;
  const description = record.description as
    | Partial<Record<AppLocale, unknown>>
    | undefined;

  if (!description || typeof description !== "object") {
    errors.push("Missing description object.");
  }

  const normalizedDescription = {} as ProductCopyDescription;
  for (const locale of PRODUCT_COPY_LOCALES) {
    const raw = description?.[locale];
    if (typeof raw !== "string" || raw.trim().length === 0) {
      errors.push(`Missing non-empty description.${locale}.`);
      normalizedDescription[locale] = "";
      continue;
    }

    normalizedDescription[locale] = raw.trim();
  }

  const rawSources = Array.isArray(record.sources) ? record.sources : [];
  const sources = rawSources
    .map((source) => {
      if (!source || typeof source !== "object") return null;
      const sourceRecord = source as Record<string, unknown>;
      const title = sourceRecord.title;
      const url = sourceRecord.url;

      if (typeof title !== "string" || typeof url !== "string") {
        return null;
      }

      return { title: title.trim(), url: url.trim() };
    })
    .filter(
      (source): source is { title: string; url: string } =>
        Boolean(source?.title) && Boolean(source?.url)
    );

  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((warning): warning is string => typeof warning === "string")
    : [];

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    draft: {
      description: normalizedDescription,
      sources,
      warnings,
    },
  };
}
