"use client";

import { useEffect } from "react";

// TODO: To enable Sentry error monitoring, run:
//   npm install @sentry/nextjs
//   npx @sentry/wizard@latest -i nextjs
// Then replace this stub with the generated Sentry configuration.
// The NEXT_PUBLIC_SENTRY_DSN env var is already declared in .env.example.
export function SentryInit() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  useEffect(() => {
    if (dsn) {
      // Stub: Sentry package not installed yet. See TODO above.
    }
  }, [dsn]);

  return null;
}
