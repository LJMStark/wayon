import { expect, test } from "vitest";

import { asciifyMediaFilename, toAsciiSlug } from "./asciifyMediaFilename.ts";

type HookArg = Parameters<typeof asciifyMediaFilename>[0];

function runHook(operation: string, name: string): string {
  const req = { file: { name } };
  asciifyMediaFilename({ operation, req } as unknown as HookArg);
  return req.file.name;
}

test("transliterates a CJK product filename, keeping the ASCII code prefix", () => {
  expect(toAsciiSlug("LV927L175翡翠白实拍图")).toBe("lv927l175-feicuibaishipaitu");
});

test("joins pinyin within a CJK run", () => {
  expect(toAsciiSlug("翡翠白元素图")).toBe("feicuibaiyuansutu");
});

test("uses v in place of ü", () => {
  expect(toAsciiSlug("绿色")).toBe("lvse");
});

test("treats punctuation, spaces and symbols as boundaries", () => {
  expect(toAsciiSlug("A_B (2)")).toBe("a-b-2");
});

test("passes through an already-ASCII name unchanged (lowercased)", () => {
  expect(toAsciiSlug("kitchen-countertops")).toBe("kitchen-countertops");
});

test("returns empty string when nothing transliterable remains", () => {
  expect(toAsciiSlug("___")).toBe("");
});

test("hook rewrites a CJK filename to an ascii slug with suffix + extension", () => {
  expect(runHook("create", "LV927L175翡翠白实拍图.jpg")).toMatch(
    /^lv927l175-feicuibaishipaitu-[a-z0-9]{6}\.jpg$/
  );
});

test("hook normalizes the extension to lowercase", () => {
  expect(runHook("create", "塔斯曼石.JPEG")).toMatch(
    /^tasimanshi-[a-z0-9]{6}\.jpeg$/
  );
});

test("hook leaves an already-ASCII filename untouched", () => {
  expect(runHook("create", "case-sales-006.jpg")).toBe("case-sales-006.jpg");
});

test("hook ignores operations that carry no uploaded file", () => {
  expect(runHook("read", "翡翠白.jpg")).toBe("翡翠白.jpg");
});
