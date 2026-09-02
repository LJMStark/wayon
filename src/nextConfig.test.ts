import { afterEach, beforeEach, expect, test, vi } from "vitest";

import nextConfig from "../next.config";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: Array<{ type: string; value: string }>;
};

type HeadersConfig = {
  headers: () => Promise<Array<{ headers: Array<{ key: string; value: string }> }>>;
};

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function getRedirects(): Promise<Redirect[]> {
  return (
    nextConfig as { redirects: () => Promise<Redirect[]> }
  ).redirects();
}

async function getContentSecurityPolicy(
  config: HeadersConfig
): Promise<string | undefined> {
  const headers = await config.headers();
  return headers
    .flatMap((entry) => entry.headers)
    .find((header) => header.key === "Content-Security-Policy")?.value;
}

test("legacy redirects are permanent for SEO migration", async () => {
  const redirects = await getRedirects();

  expect(redirects.length).toBeGreaterThan(0);
  expect(redirects).toContainEqual(
    {
      source: "/products/quartz.html",
      destination: "/zh/products?series=texture-slab",
      permanent: true,
    }
  );
  expect(redirects.every((redirect) => redirect.permanent)).toBe(true);
});

test("www requests permanently consolidate on the canonical apex host", async () => {
  const redirects = await getRedirects();

  expect(redirects).toContainEqual({
    source: "/:path*",
    has: [{ type: "host", value: "www.zylsinteredstone.com" }],
    destination: "https://zylsinteredstone.com/:path*",
    permanent: true,
  });
});

test("public R2 hostname is allowed by media CSP and image config", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://media.example.com");
  vi.stubEnv("R2_PUBLIC_URL", "https://fallback.example.com");

  const importedConfig = await import("../next.config");
  const config = importedConfig.default as HeadersConfig & {
    images: { remotePatterns: Array<{ hostname: string }> };
  };
  const csp = await getContentSecurityPolicy(config);

  expect(config.images.remotePatterns).toContainEqual(
    expect.objectContaining({ hostname: "media.example.com" })
  );
  expect(csp).toContain("media-src 'self' https://media.example.com");
});

test("development CSP keeps localhost assets on HTTP", async () => {
  vi.stubEnv("NODE_ENV", "development");

  const importedConfig = await import("../next.config");
  const config = importedConfig.default as HeadersConfig;
  const csp = await getContentSecurityPolicy(config);

  expect(csp).not.toContain("upgrade-insecure-requests");
});

test("production CSP upgrades insecure requests", async () => {
  vi.stubEnv("NODE_ENV", "production");

  const importedConfig = await import("../next.config");
  const config = importedConfig.default as HeadersConfig;
  const csp = await getContentSecurityPolicy(config);

  expect(csp).toContain("upgrade-insecure-requests");
});

// TRANSITIONAL — delete alongside LEGACY_R2_ORIGIN in next.config.ts once
// `products.cover_image_url` no longer holds `pub-*.r2.dev` strings. Until then,
// dropping the legacy origin from CSP blocks those 74 product covers outright.
const LEGACY_R2_ORIGIN = "https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev";

test("CSP still allows the legacy r2.dev origin while Payload rows hold it", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://cdn.zylsinteredstone.com");

  const importedConfig = await import("../next.config");
  const config = importedConfig.default as HeadersConfig;
  const csp = await getContentSecurityPolicy(config);

  expect(csp).toContain(
    `img-src 'self' data: blob: https://cdn.zylsinteredstone.com ${LEGACY_R2_ORIGIN}`
  );
  expect(csp).toContain(
    `media-src 'self' https://cdn.zylsinteredstone.com ${LEGACY_R2_ORIGIN}`
  );
});

test("legacy origin is not duplicated when it is still the configured origin", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", LEGACY_R2_ORIGIN);

  const importedConfig = await import("../next.config");
  const config = importedConfig.default as HeadersConfig;
  const csp = await getContentSecurityPolicy(config);

  if (!csp) throw new Error("Content-Security-Policy header is missing");

  const occurrences = csp.split(LEGACY_R2_ORIGIN).length - 1;
  expect(occurrences).toBe(2); // once in img-src, once in media-src
});

test("both media origins are mirrored into image remotePatterns", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://cdn.zylsinteredstone.com");

  const importedConfig = await import("../next.config");
  const config = importedConfig.default as {
    images: { remotePatterns: Array<{ hostname: string }> };
  };

  expect(config.images.remotePatterns.map((p) => p.hostname)).toEqual([
    "cdn.zylsinteredstone.com",
    "pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev",
  ]);
});
