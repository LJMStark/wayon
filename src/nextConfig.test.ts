import { beforeEach, expect, test, vi } from "vitest";

import nextConfig from "../next.config";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: Array<{ type: string; value: string }>;
};

beforeEach(() => {
  vi.resetModules();
});

async function getRedirects(): Promise<Redirect[]> {
  return (
    nextConfig as { redirects: () => Promise<Redirect[]> }
  ).redirects();
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
  const config = importedConfig.default as {
    headers: () => Promise<Array<{ headers: Array<{ key: string; value: string }> }>>;
    images: { remotePatterns: Array<{ hostname: string }> };
  };
  const headers = await config.headers();
  const csp = headers
    .flatMap((entry) => entry.headers)
    .find((header) => header.key === "Content-Security-Policy")?.value;

  expect(config.images.remotePatterns).toContainEqual(
    expect.objectContaining({ hostname: "media.example.com" })
  );
  expect(csp).toContain("media-src 'self' https://media.example.com");

  vi.unstubAllEnvs();
});
