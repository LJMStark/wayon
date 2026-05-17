"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useMemo } from "react";

import type { AppLocale } from "@/i18n/types";

const NEWS_LOCALE_LINKS: Array<{ label: string; locale: AppLocale }> = [
  { locale: "zh", label: "查看中文" },
  { locale: "en", label: "English" },
  { locale: "es", label: "Español" },
  { locale: "ar", label: "العربية" },
];

export function NewsFrontendLinksField() {
  const { collectionSlug, data } = useDocumentInfo();
  const formSlug = useFormFields(([fields]) => fields?.slug?.value);

  const slug = useMemo(() => {
    return normalizeSlug(formSlug ?? data?.slug);
  }, [formSlug, data?.slug]);

  if (collectionSlug !== "news") {
    return null;
  }

  return (
    <div
      style={{
        marginBlock: 16,
        padding: 12,
        border: "1px solid var(--theme-elevation-100)",
        borderRadius: 6,
        background: "var(--theme-elevation-50)",
      }}
    >
      <div
        style={{
          color: "var(--theme-text)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        前台查看
      </div>

      {slug ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NEWS_LOCALE_LINKS.map(({ label, locale }) => (
            <a
              href={getNewsHref(locale, slug)}
              key={locale}
              rel="noreferrer"
              style={linkStyle}
              target="_blank"
            >
              {label}
            </a>
          ))}
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 12 }}>
          填写链接标识后会显示各语言前台链接。
        </div>
      )}

      <div style={{ color: "#6b7280", fontSize: 11, marginTop: 8 }}>
        只打开已发布页面；草稿仍按前台规则显示 404。
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  alignItems: "center",
  background: "var(--theme-elevation-0, #fff)",
  border: "1px solid var(--theme-elevation-200)",
  borderRadius: 4,
  color: "var(--theme-text)",
  display: "inline-flex",
  fontSize: 12,
  fontWeight: 600,
  minHeight: 32,
  padding: "6px 10px",
  textDecoration: "none",
};

function getNewsHref(locale: AppLocale, slug: string): string {
  return `/${locale}/news/${encodeURIComponent(slug)}`;
}

function normalizeSlug(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/^\/+|\/+$/g, "") : "";
}
