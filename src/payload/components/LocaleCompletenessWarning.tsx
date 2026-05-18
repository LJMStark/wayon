"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useEffect, useState } from "react";

import type { AppLocale } from "@/i18n/types";

import {
  LOCALE_LABEL,
  REQUIRED_LOCALIZED_FIELDS,
  buildLocaleAllFetchUrl,
  localesMissing,
} from "./localeStatusUtils";

export function LocaleCompletenessWarning() {
  const { id, collectionSlug, savedDocumentData } = useDocumentInfo();
  const requiredFields = collectionSlug
    ? REQUIRED_LOCALIZED_FIELDS[collectionSlug]
    : undefined;

  // savedDocumentData.updatedAt changes after each successful save, so we use
  // it as a refetch trigger. Unsaved edits do not change the warning — it
  // reflects "what publish-now would render", which is the saved state.
  const savedAtSignal =
    savedDocumentData &&
    typeof savedDocumentData === "object" &&
    "updatedAt" in savedDocumentData
      ? String(
          (savedDocumentData as { updatedAt?: unknown }).updatedAt ?? ""
        )
      : "";

  const [missingLocales, setMissingLocales] = useState<AppLocale[] | null>(null);

  useEffect(() => {
    if (!id || !collectionSlug || !requiredFields) return;
    let cancelled = false;
    fetch(buildLocaleAllFetchUrl(collectionSlug, String(id)), {
      credentials: "include",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((doc: Record<string, unknown> | null) => {
        if (cancelled || !doc) return;
        setMissingLocales(localesMissing(doc, collectionSlug));
      })
      .catch(() => {
        // Network error — keep prior state, do not flash a stale warning.
      });
    return () => {
      cancelled = true;
    };
  }, [id, collectionSlug, requiredFields, savedAtSignal]);

  if (!id || !requiredFields) return null;
  if (!missingLocales || missingLocales.length === 0) return null;

  const fieldHint = requiredFields.includes("body") ? "标题和正文" : "标题";

  return (
    <div
      role="status"
      style={{
        marginBlock: 16,
        padding: "10px 14px",
        borderRadius: 6,
        border: "1px solid #fbbf24",
        background: "#fef3c7",
        color: "#78350f",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        ⚠ 这条内容还缺：{missingLocales
          .map((locale) => LOCALE_LABEL[locale])
          .join("、")}
      </div>
      <div style={{ color: "#92400e" }}>
        缺失语种的页面将自动显示英文兜底；英文也未填写时该语种页面会显示空白。建议补全{fieldHint}后再发布。
      </div>
    </div>
  );
}
