import { getPayload, type Payload } from "payload";

import config from "@payload-config";
import type { AppLocale } from "@/i18n/types";

const APP_LOCALES: AppLocale[] = ["en", "zh", "es", "ar"];

let cached: Promise<Payload> | null = null;

export async function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config });
  }
  return cached;
}

type LocalizedRecord = Record<string, unknown> | null | undefined;

export function localizedString(
  value: unknown
): Record<AppLocale, string> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as LocalizedRecord;
  const result = {} as Record<AppLocale, string>;
  let hasAny = false;

  for (const locale of APP_LOCALES) {
    const raw = (record as Record<string, unknown>)[locale];
    if (typeof raw === "string" && raw.length > 0) {
      result[locale] = raw;
      hasAny = true;
    } else {
      result[locale] = "";
    }
  }

  return hasAny ? result : undefined;
}

export function localizedRich<T>(value: unknown): Record<AppLocale, T> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const result = {} as Record<AppLocale, T>;
  let hasAny = false;

  for (const locale of APP_LOCALES) {
    const raw = record[locale];
    if (raw) {
      result[locale] = raw as T;
      hasAny = true;
    }
  }

  return hasAny ? result : undefined;
}

export function mediaUrl(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const url = (value as { url?: string | null }).url;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

export function relationshipValue<T>(value: unknown): T | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return value as T;
}
