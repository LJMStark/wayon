"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AppLocale } from "@/i18n/types";

const TARGET_LOCALES: AppLocale[] = ["en", "es", "ar"];
const LOCALE_LABEL: Record<AppLocale, string> = {
  zh: "中文",
  en: "English",
  es: "Español",
  ar: "العربية",
};

const COLLECTION_FIELDS: Record<
  string,
  Array<{ name: string; label: string }>
> = {
  news: [
    { name: "title", label: "标题" },
    { name: "excerpt", label: "摘要" },
    { name: "body", label: "正文" },
  ],
  products: [
    { name: "title", label: "标题" },
    { name: "description", label: "描述" },
  ],
};

type Props = {
  collectionSlug: string;
};

type DocSummary = {
  id: string;
  label: string;
  pending: Array<{ field: string; locale: AppLocale }>;
};

export function BatchTranslateButton({ collectionSlug }: Props) {
  const router = useRouter();
  const fields = COLLECTION_FIELDS[collectionSlug];
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  if (!fields) return null;

  const handleScan = async () => {
    setScanning(true);
    setDocs([]);
    setErrors([]);
    setCompleted(false);
    try {
      const response = await fetch(
        `/api/${collectionSlug}?limit=200&depth=0&locale=all`,
        { credentials: "include" }
      );
      if (!response.ok) {
        throw new Error(`扫描失败: HTTP ${response.status}`);
      }
      const json = (await response.json()) as { docs: Record<string, unknown>[] };
      const summaries: DocSummary[] = [];
      for (const doc of json.docs ?? []) {
        const pending = collectMissing(doc, fields);
        if (pending.length === 0) continue;
        summaries.push({
          id: String(doc.id),
          label: pickDocLabel(doc),
          pending,
        });
      }
      setDocs(summaries);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "扫描失败"]);
    } finally {
      setScanning(false);
    }
  };

  const handleRun = async () => {
    if (running || docs.length === 0) return;
    setRunning(true);
    setErrors([]);
    setProgress({ done: 0, total: docs.length });

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const conflicts: Record<
        string,
        Partial<Record<AppLocale, "translate" | "keep">>
      > = {};
      const fieldSet = new Set<string>();
      const localeSet = new Set<AppLocale>();
      for (const item of doc.pending) {
        fieldSet.add(item.field);
        localeSet.add(item.locale);
        conflicts[item.field] = conflicts[item.field] ?? {};
        conflicts[item.field]![item.locale] = "translate";
      }
      try {
        const response = await fetch("/api/translate-doc", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collection: collectionSlug,
            docId: doc.id,
            locales: Array.from(localeSet),
            fields: Array.from(fieldSet),
            conflicts,
          }),
        });
        if (!response.ok) {
          const text = await response.text();
          setErrors((prev) => [
            ...prev,
            `${doc.label}: HTTP ${response.status} — ${text.slice(0, 200)}`,
          ]);
        }
      } catch (err) {
        setErrors((prev) => [
          ...prev,
          `${doc.label}: ${err instanceof Error ? err.message : "请求失败"}`,
        ]);
      }
      setProgress({ done: i + 1, total: docs.length });
    }

    setRunning(false);
    setCompleted(true);
    router.refresh();
  };

  return (
    <div style={{ marginBlock: 16 }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 14px",
          background: "var(--theme-success-500, #10b981)",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        🌐 批量补齐缺失语言
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget && !running) {
              setOpen(false);
            }
          }}
        >
          <div
            style={{
              background: "var(--theme-bg, #fff)",
              color: "var(--theme-text, #111)",
              borderRadius: 8,
              padding: 24,
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>
              批量补齐缺失语言
            </h2>
            <p style={{ marginTop: 0, fontSize: 13, color: "#6b7280" }}>
              扫描所有 <strong>{collectionSlug}</strong> 文档，
              找出非中文语言为空的字段，并一次性翻译。已有内容不会被覆盖（如需覆盖请在单篇编辑页处理）。
            </p>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={scanning || running}
                onClick={handleScan}
                style={{
                  padding: "8px 14px",
                  background: "transparent",
                  color: "var(--theme-text)",
                  border: "1px solid var(--theme-elevation-200)",
                  borderRadius: 4,
                  cursor: scanning || running ? "not-allowed" : "pointer",
                  fontSize: 13,
                }}
              >
                {scanning ? "扫描中…" : "扫描"}
              </button>
              {docs.length > 0 ? (
                <button
                  type="button"
                  disabled={running}
                  onClick={handleRun}
                  style={{
                    padding: "8px 14px",
                    background: "var(--theme-success-500, #10b981)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: running ? "not-allowed" : "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {running
                    ? `翻译中 ${progress.done}/${progress.total}`
                    : `开始翻译 ${docs.length} 个文档`}
                </button>
              ) : null}
            </div>

            {docs.length === 0 && !scanning ? (
              <p style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                点「扫描」开始检查。
              </p>
            ) : null}

            {docs.length > 0 ? (
              <ul
                style={{
                  marginTop: 16,
                  padding: 0,
                  listStyle: "none",
                  fontSize: 12,
                  maxHeight: 320,
                  overflow: "auto",
                  border: "1px solid var(--theme-elevation-100)",
                  borderRadius: 4,
                }}
              >
                {docs.map((doc) => (
                  <li
                    key={doc.id}
                    style={{
                      padding: 8,
                      borderBottom: "1px solid var(--theme-elevation-50)",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{doc.label}</div>
                    <div style={{ color: "#6b7280", marginTop: 2 }}>
                      待翻译：
                      {doc.pending
                        .map(
                          (p) =>
                            `${p.field}/${LOCALE_LABEL[p.locale]}`
                        )
                        .join("、")}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {errors.length > 0 ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                {errors.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            ) : null}

            {completed ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  background: "#dcfce7",
                  color: "#166534",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ✓ 完成。建议进入单篇编辑页审核 AI 翻译结果。
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                disabled={running}
                onClick={() => setOpen(false)}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "var(--theme-text)",
                  border: "1px solid var(--theme-elevation-200)",
                  borderRadius: 4,
                  cursor: running ? "not-allowed" : "pointer",
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function collectMissing(
  doc: Record<string, unknown>,
  fields: Array<{ name: string; label: string }>
): Array<{ field: string; locale: AppLocale }> {
  const missing: Array<{ field: string; locale: AppLocale }> = [];
  const zhFields = fields.filter((field) =>
    hasContent(readLocaleValue(doc, field.name, "zh"))
  );
  for (const field of zhFields) {
    for (const locale of TARGET_LOCALES) {
      if (!hasContent(readLocaleValue(doc, field.name, locale))) {
        missing.push({ field: field.name, locale });
      }
    }
  }
  return missing;
}

function readLocaleValue(
  doc: Record<string, unknown>,
  field: string,
  locale: AppLocale
): unknown {
  const value = doc[field];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return (value as Record<string, unknown>)[locale];
  }
  return value;
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

function pickDocLabel(doc: Record<string, unknown>): string {
  const title = doc.title;
  if (typeof title === "string" && title.trim()) return title;
  if (title && typeof title === "object") {
    const candidates = ["zh", "en", "es", "ar"] as const;
    for (const key of candidates) {
      const value = (title as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  const slug = doc.slug;
  if (typeof slug === "string" && slug) return slug;
  return String(doc.id ?? "(unnamed)");
}
