import { describe, expect, it } from "vitest";

import {
  hasArabic,
  hasCJKContamination,
  hasHan,
  validateCopyPurity,
} from "./copyPurity";

const cleanDraft = {
  zh: "这是一段足够长的中文产品描述示例",
  en: "A sufficiently long english description here.",
  es: "Una descripcion suficientemente larga en espanol.",
  ar: "هذا وصف عربي طويل بما يكفي لتجاوز الحد الأدنى.",
};

describe("validateCopyPurity", () => {
  it("accepts a clean 4-locale draft", () => {
    expect(validateCopyPurity(cleanDraft)).toBeNull();
  });

  it("rejects a locale shorter than 10 chars at the boundary", () => {
    // Arrange: exactly 9 chars after trim
    const draft = { ...cleanDraft, en: "123456789" };

    // Act + Assert
    expect(validateCopyPurity(draft)).toBe("en空/过短");
  });

  it("accepts a locale with exactly 10 chars", () => {
    const draft = { ...cleanDraft, en: "1234567890" };

    expect(validateCopyPurity(draft)).toBeNull();
  });

  it("rejects a missing locale", () => {
    const draft = { ...cleanDraft, ar: undefined };

    expect(validateCopyPurity(draft)).toBe("ar空/过短");
  });

  it("rejects zh copy that contains no Han characters", () => {
    const draft = { ...cleanDraft, zh: "no chinese here but long enough" };

    expect(validateCopyPurity(draft)).toBe("zh无中文");
  });

  it("rejects en copy contaminated with Han characters", () => {
    const draft = { ...cleanDraft, en: "This english has 中文 inside it." };

    expect(validateCopyPurity(draft)).toBe("en混中文");
  });

  it("rejects en copy contaminated with fullwidth Chinese punctuation", () => {
    // "Hello，world" — every letter Latin, but the comma is U+FF0C
    const draft = { ...cleanDraft, en: "Hello，world and this is long enough" };

    expect(validateCopyPurity(draft)).toBe("en混中文");
  });

  it("rejects es copy contaminated with CJK Extension A ideographs", () => {
    const draft = { ...cleanDraft, es: "Texto largo con un caracter 㐀 raro." };

    expect(validateCopyPurity(draft)).toBe("es混中文");
  });

  it("rejects ar copy that contains no Arabic script", () => {
    const draft = { ...cleanDraft, ar: "not arabic but definitely long enough" };

    expect(validateCopyPurity(draft)).toBe("ar非阿拉伯文");
  });
});

describe("purity helpers", () => {
  it("hasHan detects URO and Extension A ideographs only", () => {
    expect(hasHan("岩板")).toBe(true);
    expect(hasHan("㐀")).toBe(true);
    expect(hasHan("latin only，")).toBe(false);
  });

  it("hasCJKContamination additionally catches fullwidth punctuation", () => {
    expect(hasCJKContamination("latin only，")).toBe(true);
    expect(hasCJKContamination("（brackets）")).toBe(true);
    expect(hasCJKContamination("plain latin, nothing else")).toBe(false);
  });

  it("hasArabic detects the Arabic block", () => {
    expect(hasArabic("وصف")).toBe(true);
    expect(hasArabic("latin")).toBe(false);
  });
});
