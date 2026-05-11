import type { Endpoint, PayloadRequest } from "payload";

import type { AppLocale } from "../../i18n/types.ts";
import { getGlmConfig } from "../../lib/server-env.ts";
import { translateLexical } from "../../lib/translation/translateLexical.ts";
import { translatePlainText } from "../../lib/translation/translatePlain.ts";

import {
  TRANSLATION_META_FIELD_NAME,
  readTranslationMeta,
  setTranslationMetaEntry,
  type TranslationMeta,
} from "../fields/translationMeta.ts";

const SUPPORTED_LOCALES: AppLocale[] = ["en", "es", "ar"];

const COLLECTION_FIELD_TYPES: Record<
  string,
  Record<string, "plain" | "rich">
> = {
  news: { title: "plain", excerpt: "plain", body: "rich" },
  products: { title: "plain", description: "plain" },
};

type RequestBody = {
  collection: string;
  docId: string;
  locales: AppLocale[];
  fields: string[];
  // For each (field, locale) the operator confirmed in the conflict modal.
  // If a locale/field is omitted, it is skipped entirely.
  conflicts: Record<string, Partial<Record<AppLocale, "translate" | "keep">>>;
};

type LocalePatch = Record<string, unknown>;

type Summary = {
  translated: Array<{ field: string; locale: AppLocale }>;
  skipped: Array<{ field: string; locale: AppLocale; reason: string }>;
};

export const translateDocEndpoint: Endpoint = {
  path: "/translate-doc",
  method: "post",
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    let body: RequestBody;
    try {
      body = (await req.json?.()) as RequestBody;
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const fieldTypes = COLLECTION_FIELD_TYPES[body?.collection];
    if (!fieldTypes) {
      return jsonResponse(
        { error: `Unsupported collection: ${body?.collection}` },
        400
      );
    }
    if (!body.docId || typeof body.docId !== "string") {
      return jsonResponse({ error: "Missing docId" }, 400);
    }
    const targetLocales = (body.locales ?? []).filter((locale): locale is AppLocale =>
      SUPPORTED_LOCALES.includes(locale)
    );
    if (targetLocales.length === 0) {
      return jsonResponse({ error: "No target locales selected" }, 400);
    }
    const targetFields = (body.fields ?? []).filter((field) =>
      Object.prototype.hasOwnProperty.call(fieldTypes, field)
    );
    if (targetFields.length === 0) {
      return jsonResponse({ error: "No translatable fields selected" }, 400);
    }
    const conflicts = body.conflicts ?? {};

    // Fail fast if GLM key is missing — easier to debug than a runtime fetch error.
    try {
      getGlmConfig();
    } catch (error) {
      return jsonResponse(
        {
          error:
            error instanceof Error
              ? error.message
              : "GLM configuration is missing",
        },
        500
      );
    }

    const doc = await req.payload.findByID({
      collection: body.collection as "news" | "products",
      id: body.docId,
      locale: "all",
      depth: 0,
      overrideAccess: false,
      user: req.user,
    });

    if (!doc) {
      return jsonResponse({ error: "Document not found" }, 404);
    }

    const summary: Summary = { translated: [], skipped: [] };
    let nextMeta: TranslationMeta = readTranslationMeta(
      (doc as unknown as Record<string, unknown>)[TRANSLATION_META_FIELD_NAME]
    );
    const { model } = getGlmConfig();
    const translatedAt = new Date().toISOString();

    for (const locale of targetLocales) {
      const localePatch: LocalePatch = {};

      for (const field of targetFields) {
        const decision = conflicts[field]?.[locale];
        if (decision !== "translate") {
          summary.skipped.push({
            field,
            locale,
            reason: decision === "keep" ? "kept-existing" : "not-selected",
          });
          continue;
        }

        const sourceValue = readLocalizedFieldValue(doc, field, "zh");
        if (!hasContent(sourceValue)) {
          summary.skipped.push({
            field,
            locale,
            reason: "empty-source",
          });
          continue;
        }

        try {
          const translated = await translateField(
            sourceValue,
            fieldTypes[field],
            locale
          );
          if (!hasContent(translated)) {
            summary.skipped.push({
              field,
              locale,
              reason: "empty-output",
            });
            continue;
          }
          localePatch[field] = translated;
          summary.translated.push({ field, locale });
          nextMeta = setTranslationMetaEntry(nextMeta, field, locale, {
            autoTranslated: true,
            translatedAt,
            model,
          });
        } catch (error) {
          summary.skipped.push({
            field,
            locale,
            reason:
              error instanceof Error
                ? `error: ${error.message.slice(0, 200)}`
                : "translation-failed",
          });
        }
      }

      if (Object.keys(localePatch).length === 0) continue;

      await req.payload.update({
        collection: body.collection as "news" | "products",
        id: body.docId,
        locale,
        data: localePatch,
        depth: 0,
        overrideAccess: false,
        user: req.user,
        context: { fromTranslator: true },
      });
    }

    if (summary.translated.length > 0) {
      await req.payload.update({
        collection: body.collection as "news" | "products",
        id: body.docId,
        data: { [TRANSLATION_META_FIELD_NAME]: nextMeta },
        depth: 0,
        overrideAccess: false,
        user: req.user,
        context: { fromTranslator: true },
      });
    }

    return jsonResponse({ ok: true, summary });
  },
};

function readLocalizedFieldValue(
  doc: unknown,
  field: string,
  locale: AppLocale
): unknown {
  if (!doc || typeof doc !== "object") return undefined;
  const fieldValue = (doc as Record<string, unknown>)[field];
  if (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
    return (fieldValue as Record<string, unknown>)[locale];
  }
  return fieldValue;
}

function hasContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") {
    const root = (value as { root?: { children?: unknown[] } }).root;
    if (root && Array.isArray(root.children)) return root.children.length > 0;
    return Object.keys(value as Record<string, unknown>).length > 0;
  }
  return false;
}

async function translateField(
  source: unknown,
  type: "plain" | "rich",
  locale: AppLocale
): Promise<unknown> {
  if (type === "plain") {
    if (typeof source !== "string") return "";
    return translatePlainText(source, locale);
  }
  if (!source || typeof source !== "object") return null;
  return translateLexical(
    source as Parameters<typeof translateLexical>[0],
    locale
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
