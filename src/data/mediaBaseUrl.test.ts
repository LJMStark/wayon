import { afterEach, beforeEach, expect, test, vi } from "vitest";

type MediaBaseUrlModule = typeof import("./mediaBaseUrl");

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function loadModule(): Promise<MediaBaseUrlModule> {
  return import("./mediaBaseUrl");
}

test("prefers the public env var so the client bundle resolves the same origin", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://media.example.com");
  vi.stubEnv("R2_PUBLIC_URL", "https://fallback.example.com");

  const { R2_PUBLIC_BASE_URL } = await loadModule();

  expect(R2_PUBLIC_BASE_URL).toBe("https://media.example.com");
});

test("falls back to the server-only env var when the public one is unset", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "");
  vi.stubEnv("R2_PUBLIC_URL", "https://fallback.example.com");

  const { R2_PUBLIC_BASE_URL } = await loadModule();

  expect(R2_PUBLIC_BASE_URL).toBe("https://fallback.example.com");
});

test("falls back to the custom media domain, never the retired r2.dev host", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "");
  vi.stubEnv("R2_PUBLIC_URL", "");

  const { R2_PUBLIC_BASE_URL } = await loadModule();

  expect(R2_PUBLIC_BASE_URL).toBe("https://cdn.zylsinteredstone.com");
  expect(R2_PUBLIC_BASE_URL).not.toContain("r2.dev");
});

test("strips trailing slashes so joined paths never double up", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://media.example.com///");

  const { R2_PUBLIC_BASE_URL, mediaAssetUrl } = await loadModule();

  expect(R2_PUBLIC_BASE_URL).toBe("https://media.example.com");
  expect(mediaAssetUrl("photo.jpg")).toBe("https://media.example.com/photo.jpg");
});

test("joins a bare filename onto the media origin", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://media.example.com");

  const { mediaAssetUrl } = await loadModule();

  expect(mediaAssetUrl("about-warehouse.mp4")).toBe(
    "https://media.example.com/about-warehouse.mp4"
  );
});

test("trims a leading slash instead of emitting a double slash", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://media.example.com");

  const { mediaAssetUrl } = await loadModule();

  expect(mediaAssetUrl("/about-warehouse.mp4")).toBe(
    "https://media.example.com/about-warehouse.mp4"
  );
});

test("preserves percent-encoding for CJK object keys", async () => {
  vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://media.example.com");

  const { mediaAssetUrl } = await loadModule();
  const encoded = "ZL1224L936%E4%B8%9D%E7%BB%B8%E7%99%BD%E5%85%83%E7%B4%A0%E5%9B%BE.jpg";

  expect(mediaAssetUrl(encoded)).toBe(`https://media.example.com/${encoded}`);
});
