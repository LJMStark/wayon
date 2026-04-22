import { expect, test } from "vitest";

import { chineseSlugify } from "./slugify";

test("chineseSlugify converts pure Chinese titles to dashed pinyin", () => {
  expect(chineseSlugify("意大利木纹")).toBe("yi-da-li-mu-wen");
  expect(chineseSlugify("质感岩板")).toBe("zhi-gan-yan-ban");
});

test("chineseSlugify lowercases and dashes ASCII input", () => {
  expect(chineseSlugify("ZYL Stone v2")).toBe("zyl-stone-v2");
  expect(chineseSlugify("Quartz_Pure-001")).toBe("quartz-pure-001");
});

test("chineseSlugify handles mixed CJK + Latin input", () => {
  expect(chineseSlugify("意大利 Marble v3")).toBe("yi-da-li-marble-v3");
});

test("chineseSlugify collapses repeated separators and trims edges", () => {
  expect(chineseSlugify("---hello---world---")).toBe("hello-world");
  expect(chineseSlugify("  spaces   only   ")).toBe("spaces-only");
});

test("chineseSlugify returns empty string when nothing remains after sanitation", () => {
  expect(chineseSlugify("")).toBe("");
  expect(chineseSlugify("!!!@@@###")).toBe("");
});
