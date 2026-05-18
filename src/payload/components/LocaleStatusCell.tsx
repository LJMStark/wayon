"use client";

import { useEffect, useState } from "react";

import type { AppLocale } from "@/i18n/types";

import {
  LOCALES,
  buildLocaleAllFetchUrl,
  computeLocaleStatus,
  type LocaleStatusMap,
} from "./localeStatusUtils";

type CellProps = {
  rowData?: { id?: string; updatedAt?: string };
};

const LOCALE_BADGE: Record<AppLocale, string> = {
  zh: "中",
  en: "EN",
  es: "ES",
  ar: "AR",
};

// Module-level cache keyed by `${collection}:${id}:${updatedAt}` so a row
// edited within the same admin session invalidates its cache entry as soon as
// the list view re-renders with the new updatedAt from Payload. Without the
// updatedAt component, badges would silently go stale until full page reload.
const statusCache = new Map<string, LocaleStatusMap>();

function useLocaleStatus(
  collection: string,
  id: string | undefined,
  updatedAt: string | undefined
) {
  const cacheKey = id ? `${collection}:${id}:${updatedAt ?? ""}` : "";
  const [, setFetchVersion] = useState(0);

  useEffect(() => {
    if (!id || statusCache.has(cacheKey)) return;
    let cancelled = false;
    fetch(buildLocaleAllFetchUrl(collection, id), { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((doc: Record<string, unknown> | null) => {
        if (cancelled || !doc) return;
        statusCache.set(cacheKey, computeLocaleStatus(doc, collection));
        setFetchVersion((v) => v + 1);
      })
      .catch(() => {
        // Network error — show neutral placeholder, do not cache failure.
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, collection, id]);

  return cacheKey ? statusCache.get(cacheKey) ?? null : null;
}

function StatusBadges({ status }: { status: LocaleStatusMap | null }) {
  if (!status) {
    return <span style={{ color: "var(--theme-elevation-400)" }}>…</span>;
  }
  return (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {LOCALES.map((locale) => {
        const filled = status[locale];
        return (
          <span
            key={locale}
            title={`${LOCALE_BADGE[locale]}: ${filled ? "已填写" : "未填写"}`}
            style={{
              display: "inline-block",
              minWidth: 22,
              padding: "1px 4px",
              fontSize: 10,
              lineHeight: "14px",
              textAlign: "center",
              borderRadius: 3,
              background: filled ? "#dcfce7" : "#fee2e2",
              color: filled ? "#166534" : "#991b1b",
              fontWeight: 600,
            }}
          >
            {LOCALE_BADGE[locale]}
          </span>
        );
      })}
    </div>
  );
}

export function NewsLocaleStatusCell({ rowData }: CellProps) {
  const status = useLocaleStatus("news", rowData?.id, rowData?.updatedAt);
  return <StatusBadges status={status} />;
}

export function ProductLocaleStatusCell({ rowData }: CellProps) {
  const status = useLocaleStatus("products", rowData?.id, rowData?.updatedAt);
  return <StatusBadges status={status} />;
}
