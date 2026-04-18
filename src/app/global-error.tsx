"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Fallback rendered only when the root layout itself throws. It must own
// the full document because Next.js replaces the parent layout entirely.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Root layout crashed:", error);
  }, [error]);

  return (
    <html lang="en">
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
          Something went wrong
        </h1>
        <p style={{ color: "#6b7280", maxWidth: "32rem", margin: 0 }}>
          The site failed to load. Please refresh the page.
        </p>
        {error.digest ? (
          <p
            style={{ color: "#9ca3af", fontSize: "0.75rem", margin: 0 }}
          >
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
          Try again
        </button>
      </body>
    </html>
  );
}
