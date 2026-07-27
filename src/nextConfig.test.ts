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
