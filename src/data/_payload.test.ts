import { describe, it, expect } from "vitest";

import { encodeMediaUrl } from "./_payload";

describe("encodeMediaUrl", () => {
  it("makes CJK R2 URLs Latin-1 safe so they survive HTTP headers", () => {
    // Regression: product hero images on R2 have Chinese filenames, e.g.
    // "LV927L175翡翠白元素图.jpg". Next emits a `Link: rel=preload` header for
    // the priority image; raw CJK there throws "Cannot convert argument to a
    // ByteString" (HTTP headers are Latin-1). The encoded URL must contain no
    // code point above 255.
    const raw = "https://pub-x.r2.dev/LV927L175翡翠白元素图.jpg";
    const out = encodeMediaUrl(raw);

    expect([...out].every((c) => c.charCodeAt(0) <= 255)).toBe(true);
    expect(decodeURIComponent(out)).toBe(raw);
  });

  it("leaves ASCII URLs unchanged", () => {
    const u = "https://pub-x.r2.dev/LV927L175-element.jpg";
    expect(encodeMediaUrl(u)).toBe(u);
  });

  it("is idempotent (does not double-encode existing escapes)", () => {
    const once = encodeMediaUrl("https://pub-x.r2.dev/翡翠白.jpg");
    expect(encodeMediaUrl(once)).toBe(once);
  });
});
