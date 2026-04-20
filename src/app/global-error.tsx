"use client";

import { useEffect, useState } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const MESSAGES = {
  zh: { title: "出现错误", body: "网站加载失败，请刷新页面。", retry: "重试" },
  en: { title: "Something went wrong", body: "The site failed to load. Please refresh the page.", retry: "Try again" },
  es: { title: "Algo salió mal", body: "El sitio no se pudo cargar. Por favor actualice la página.", retry: "Intentar de nuevo" },
  ar: { title: "حدث خطأ ما", body: "فشل تحميل الموقع. يرجى تحديث الصفحة.", retry: "حاول مرة أخرى" },
  ru: { title: "Что-то пошло не так", body: "Не удалось загрузить сайт. Пожалуйста, обновите страницу.", retry: "Повторить" },
} as const;

type SupportedLocale = keyof typeof MESSAGES;

function getLocaleFromCookie(): SupportedLocale {
  if (typeof document === "undefined") return "zh";
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1];
  if (value && value in MESSAGES) return value as SupportedLocale;
  return "zh";
}

// Fallback rendered only when the root layout itself throws. It must own
// the full document because Next.js replaces the parent layout entirely.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    // Reading the cookie at init time avoids a layout-effect setState call.
    // This runs only in the browser, so it is safe to access document here.
    if (typeof document !== "undefined") {
      return getLocaleFromCookie();
    }
    return "zh";
  });

  useEffect(() => {
    // Sync in case the cookie changed after first render (unlikely but safe).
    const detected = getLocaleFromCookie();
    if (detected !== locale) setLocale(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Emergency boundary: surface the crash in Vercel function logs so we
    // have at least one signal before a real error tracker is wired in.
    console.error("global-error boundary:", error);
  }, [error]);

  const msg = MESSAGES[locale];
  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"}>
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          color: "#1a1a1a",
          background: "#ffffff",
          textAlign: "center",
          gap: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, margin: 0 }}>
          {msg.title}
        </h1>
        <p style={{ color: "#6b7280", maxWidth: "32rem", margin: 0 }}>
          {msg.body}
        </p>
        {error.digest ? (
          <p style={{ color: "#9ca3af", fontSize: "0.75rem", margin: 0 }}>
            ref: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            background: "#0a1e3f",
            color: "white",
            padding: "0.75rem 1.5rem",
            fontSize: "0.875rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            border: 0,
            cursor: "pointer",
          }}
        >
          {msg.retry}
        </button>
      </body>
    </html>
  );
}
