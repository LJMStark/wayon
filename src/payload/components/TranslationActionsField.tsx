"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { AppLocale } from "@/i18n/types";

import type {
  TranslationMeta,
  TranslationMetaEntry,
} from "../fields/translationMeta";

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

type ConflictMap = Record<string, Partial<Record<AppLocale, "translate" | "keep">>>;

export function TranslationActionsField() {
  const { id, collectionSlug, data } = useDocumentInfo();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const fields = useMemo(
    () => (collectionSlug ? COLLECTION_FIELDS[collectionSlug] ?? [] : []),
    [collectionSlug]
  );

  const translationMeta = useFormFields(([f]) => {
    const value = f?.translationMeta?.value;
    return (value && typeof value === "object" ? value : {}) as TranslationMeta;
  });

  const aiTaggedEntries = useMemo(
    () => collectAiTaggedEntries(translationMeta),
    [translationMeta]
  );

  if (!id || !collectionSlug || fields.length === 0) {
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
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
          color: "var(--theme-text)",
        }}
      >
        多语言翻译
      </div>

      {aiTaggedEntries.length > 0 ? (
        <div style={{ marginBottom: 10, fontSize: 12, lineHeight: 1.5 }}>
          <div
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 999,
              background: "#dbeafe",
              color: "#1e40af",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            🤖 AI 翻译，建议审核
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", color: "#374151" }}>
            {aiTaggedEntries.map(({ field, locale, entry }) => {
              const fieldLabel =
                fields.find((f) => f.name === field)?.label ?? field;
              return (
                <li key={`${field}-${locale}`}>
                  {fieldLabel} · {LOCALE_LABEL[locale]} ·{" "}
                  {formatTranslatedAt(entry.translatedAt)}
                </li>
              );
            })}
          </ul>
          <div style={{ marginTop: 6, color: "#6b7280", fontSize: 11 }}>
            手动改写并保存后，对应字段的提示会自动消失。
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: "var(--theme-success-500, #10b981)",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        🌐 从中文翻译为其他语言
      </button>

      {open ? (
        <TranslationModal
          collectionSlug={collectionSlug}
          docId={String(id)}
          fields={fields}
          docData={data}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

type TranslationModalProps = {
  collectionSlug: string;
  docId: string;
  fields: Array<{ name: string; label: string }>;
  docData: Record<string, unknown> | undefined;
  onClose: () => void;
  onSuccess: () => void;
};

function TranslationModal({
  collectionSlug,
  docId,
  fields,
  docData,
  onClose,
  onSuccess,
}: TranslationModalProps) {
  const [selectedLocales, setSelectedLocales] = useState<Set<AppLocale>>(
    new Set(TARGET_LOCALES)
  );
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(fields.map((f) => f.name))
  );

  const initialConflicts = useMemo(
    () => buildInitialConflicts(fields, docData),
    [fields, docData]
  );
  const [conflicts, setConflicts] = useState<ConflictMap>(initialConflicts);

  const [running, setRunning] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleLocale = (locale: AppLocale) => {
    setSelectedLocales((prev) => {
      const next = new Set(prev);
      if (next.has(locale)) next.delete(locale);
      else next.add(locale);
      return next;
    });
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const setConflict = (
    field: string,
    locale: AppLocale,
    decision: "translate" | "keep"
  ) => {
    setConflicts((prev) => ({
      ...prev,
      [field]: { ...(prev[field] ?? {}), [locale]: decision },
    }));
  };

  const sourceMissing = useMemo(() => {
    return fields
      .filter((f) => selectedFields.has(f.name))
      .filter((f) => !hasContent(readFieldLocaleValue(docData, f.name, "zh")));
  }, [fields, selectedFields, docData]);

  const handleStart = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setLogLines(["开始翻译，请勿关闭窗口…"]);

    const filteredConflicts = filterConflicts(
      conflicts,
      selectedFields,
      selectedLocales
    );

    try {
      const response = await fetch("/api/translate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          collection: collectionSlug,
          docId,
          locales: Array.from(selectedLocales),
          fields: Array.from(selectedFields),
          conflicts: filteredConflicts,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        summary: {
          translated: Array<{ field: string; locale: AppLocale }>;
          skipped: Array<{ field: string; locale: AppLocale; reason: string }>;
        };
      };

      const lines: string[] = [];
      for (const item of payload.summary.translated) {
        lines.push(`✓ ${item.field} · ${LOCALE_LABEL[item.locale]}`);
      }
      for (const item of payload.summary.skipped) {
        lines.push(
          `– ${item.field} · ${LOCALE_LABEL[item.locale]} · ${item.reason}`
        );
      }
      lines.push(`完成：成功 ${payload.summary.translated.length}，跳过 ${payload.summary.skipped.length}`);
      setLogLines(lines);

      if (payload.summary.translated.length > 0) {
        setTimeout(onSuccess, 1200);
      } else {
        setRunning(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "翻译失败");
      setRunning(false);
    }
  };

  return (
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
        if (event.target === event.currentTarget && !running) onClose();
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
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>
          从中文翻译为其他语言
        </h2>
        <p style={{ marginTop: 0, color: "var(--theme-elevation-700)", fontSize: 13 }}>
          源语言固定为<strong>中文</strong>。下面勾选想翻译的目标语言和字段，
          冲突会逐个让你决定是否覆盖已有内容。
        </p>

        <Section title="目标语言">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {TARGET_LOCALES.map((locale) => (
              <label key={locale} style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={selectedLocales.has(locale)}
                  disabled={running}
                  onChange={() => toggleLocale(locale)}
                />
                <span>{LOCALE_LABEL[locale]}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="字段">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {fields.map((field) => (
              <label key={field.name} style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={selectedFields.has(field.name)}
                  disabled={running}
                  onChange={() => toggleField(field.name)}
                />
                <span>{field.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {sourceMissing.length > 0 ? (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 4,
              background: "#fee2e2",
              color: "#991b1b",
              fontSize: 12,
            }}
          >
            ⚠ 以下字段缺少中文源文，无法翻译：
            {sourceMissing.map((f) => f.label).join("、")}
          </div>
        ) : null}

        <Section title="冲突处理（已有内容时）">
          <ConflictTable
            fields={fields.filter((f) => selectedFields.has(f.name))}
            locales={Array.from(selectedLocales)}
            conflicts={conflicts}
            docData={docData}
            disabled={running}
            onChange={setConflict}
          />
        </Section>

        {logLines.length > 0 ? (
          <Section title="进度">
            <pre
              style={{
                margin: 0,
                padding: 10,
                background: "var(--theme-elevation-50)",
                fontSize: 12,
                lineHeight: 1.6,
                maxHeight: 220,
                overflow: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {logLines.join("\n")}
            </pre>
          </Section>
        ) : null}

        {error ? (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 4,
              background: "#fee2e2",
              color: "#991b1b",
              fontSize: 13,
            }}
          >
            ❌ {error}
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
            onClick={onClose}
            style={secondaryButtonStyle}
          >
            取消
          </button>
          <button
            type="button"
            disabled={
              running ||
              selectedLocales.size === 0 ||
              selectedFields.size === 0
            }
            onClick={handleStart}
            style={primaryButtonStyle}
          >
            {running ? "翻译中…" : "开始翻译"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConflictTable({
  fields,
  locales,
  conflicts,
  docData,
  disabled,
  onChange,
}: {
  fields: Array<{ name: string; label: string }>;
  locales: AppLocale[];
  conflicts: ConflictMap;
  docData: Record<string, unknown> | undefined;
  disabled: boolean;
  onChange: (
    field: string,
    locale: AppLocale,
    decision: "translate" | "keep"
  ) => void;
}) {
  if (fields.length === 0 || locales.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        请至少选择一个字段和一个目标语言。
      </div>
    );
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 12,
      }}
    >
      <thead>
        <tr>
          <th style={thStyle}>字段</th>
          {locales.map((locale) => (
            <th key={locale} style={thStyle}>
              {LOCALE_LABEL[locale]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {fields.map((field) => (
          <tr key={field.name}>
            <td style={tdStyle}>{field.label}</td>
            {locales.map((locale) => {
              const existing = readFieldLocaleValue(docData, field.name, locale);
              const occupied = hasContent(existing);
              const decision =
                conflicts[field.name]?.[locale] ??
                (occupied ? "keep" : "translate");
              return (
                <td
                  key={locale}
                  style={{
                    ...tdStyle,
                    background: occupied ? "#fef3c7" : "transparent",
                  }}
                >
                  {occupied ? (
                    <select
                      disabled={disabled}
                      value={decision}
                      onChange={(event) =>
                        onChange(
                          field.name,
                          locale,
                          event.target.value as "translate" | "keep"
                        )
                      }
                      style={{ width: "100%", fontSize: 12 }}
                    >
                      <option value="keep">保留（不翻译）</option>
                      <option value="translate">覆盖（重新翻译）</option>
                    </select>
                  ) : (
                    <span style={{ color: "#10b981" }}>将翻译</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 6,
          color: "var(--theme-elevation-800)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const checkboxStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--theme-success-500, #10b981)",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "transparent",
  color: "var(--theme-text)",
  border: "1px solid var(--theme-elevation-200)",
  borderRadius: 4,
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 6px",
  borderBottom: "1px solid var(--theme-elevation-100)",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "8px 6px",
  borderBottom: "1px solid var(--theme-elevation-50)",
  verticalAlign: "middle",
};

function readFieldLocaleValue(
  doc: Record<string, unknown> | undefined,
  field: string,
  locale: AppLocale
): unknown {
  if (!doc) return undefined;
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

function buildInitialConflicts(
  fields: Array<{ name: string; label: string }>,
  docData: Record<string, unknown> | undefined
): ConflictMap {
  const conflicts: ConflictMap = {};
  for (const field of fields) {
    conflicts[field.name] = {};
    for (const locale of TARGET_LOCALES) {
      const occupied = hasContent(readFieldLocaleValue(docData, field.name, locale));
      conflicts[field.name]![locale] = occupied ? "keep" : "translate";
    }
  }
  return conflicts;
}

function filterConflicts(
  conflicts: ConflictMap,
  selectedFields: Set<string>,
  selectedLocales: Set<AppLocale>
): ConflictMap {
  const out: ConflictMap = {};
  for (const field of selectedFields) {
    out[field] = {};
    for (const locale of selectedLocales) {
      out[field]![locale] = conflicts[field]?.[locale] ?? "translate";
    }
  }
  return out;
}

function collectAiTaggedEntries(
  meta: TranslationMeta
): Array<{ field: string; locale: AppLocale; entry: TranslationMetaEntry }> {
  const out: Array<{
    field: string;
    locale: AppLocale;
    entry: TranslationMetaEntry;
  }> = [];
  for (const [field, perLocale] of Object.entries(meta)) {
    if (!perLocale) continue;
    for (const locale of TARGET_LOCALES) {
      const entry = perLocale[locale];
      if (entry?.autoTranslated) {
        out.push({ field, locale, entry });
      }
    }
  }
  return out;
}

function formatTranslatedAt(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  } catch {
    return iso;
  }
}
