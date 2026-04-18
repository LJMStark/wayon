import { expect, test } from "vitest";

import {
  buildTradeMediaPublicUrl,
  getTradeMediaContentType,
  resolveTradeMediaPath,
} from "./tradeMedia.ts";

const ROOT = "/Users/demon/vibecoding/wayon/docs/外贸出口资料";

test("buildTradeMediaPublicUrl encodes every path segment", () => {
  const url = buildTradeMediaPublicUrl(
    "众岩联--元素图整理/900x300x9系列/亮光/LV930L902维多利亚.jpg"
  );

  expect(url).toBe("/api/trade-media/%E4%BC%97%E5%B2%A9%E8%81%94--%E5%85%83%E7%B4%A0%E5%9B%BE%E6%95%B4%E7%90%86/900x300x9%E7%B3%BB%E5%88%97/%E4%BA%AE%E5%85%89/LV930L902%E7%BB%B4%E5%A4%9A%E5%88%A9%E4%BA%9A.jpg");
});

test("resolveTradeMediaPath resolves files inside the trade materials root", () => {
  const resolved = resolveTradeMediaPath(ROOT, [
    "展厅视频",
    "2023-04-15 102614.mov",
  ]);

  expect(resolved).toBe("/Users/demon/vibecoding/wayon/docs/外贸出口资料/展厅视频/2023-04-15 102614.mov");
});

test("resolveTradeMediaPath blocks path traversal and absolute paths", () => {
  expect(resolveTradeMediaPath(ROOT, ["..", "secret.txt"])).toBe(null);
  expect(resolveTradeMediaPath(ROOT, ["/tmp/secret.txt"])).toBe(null);
  expect(resolveTradeMediaPath(ROOT, ["%2e%2e", "secret.txt"])).toBe(null);
});

test("getTradeMediaContentType returns the declared MIME type for whitelisted extensions", () => {
  expect(getTradeMediaContentType("photo.jpg")).toBe("image/jpeg");
  expect(getTradeMediaContentType("PHOTO.JPEG")).toBe("image/jpeg");
  expect(getTradeMediaContentType("clip.mp4")).toBe("video/mp4");
  expect(getTradeMediaContentType("clip.MOV")).toBe("video/quicktime");
  expect(getTradeMediaContentType("/abs/path/icon.webp")).toBe("image/webp");
});

test("getTradeMediaContentType returns null for hidden files and non-whitelisted extensions", () => {
  // Hidden macOS / Windows index files leaked into trade catalog must NOT
  // be downloadable through the route.
  expect(getTradeMediaContentType(".DS_Store")).toBe(null);
  expect(getTradeMediaContentType("Thumbs.db")).toBe(null);
  // Office / archive formats outside the declared media types.
  expect(getTradeMediaContentType("catalog.xlsx")).toBe(null);
  expect(getTradeMediaContentType("design.psd")).toBe(null);
  expect(getTradeMediaContentType("README.txt")).toBe(null);
  // Files with no extension at all.
  expect(getTradeMediaContentType("LICENSE")).toBe(null);
});
