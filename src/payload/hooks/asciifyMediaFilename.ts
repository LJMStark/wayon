import type { CollectionBeforeOperationHook } from "payload";
import { pinyin } from "pinyin-pro";

// ASCII-ify admin upload filenames. R2 object keys with CJK characters work
// only because every read path percent-encodes them (src/data/_payload.ts
// encodeMediaUrl) to dodge the Latin-1 HTTP header ("ByteString") crash on
// Next's `Link: rel=preload`. New uploads get a clean ASCII pinyin slug at the
// source so the stored key — and its Payload size variants — never carry CJK.
//
// Only filenames containing non-ASCII are rewritten; already-ASCII names
// (company assets like `case-sales-006.jpg`) pass through untouched. Existing
// catalog files keep their CJK names and the read-time encoding.

// Maximal runs of ASCII alphanumerics OR CJK (U+3400–U+9FFF). Other characters
// (spaces, punctuation, other scripts) act as token boundaries and are dropped.
const TOKEN_RE = /[a-zA-Z0-9]+|[㐀-鿿]+/g;
const CJK_CHAR = /[㐀-鿿]/;
const MAX_SLUG_LENGTH = 60;

function hasNonAscii(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    if (value.charCodeAt(i) > 127) {
      return true;
    }
  }
  return false;
}

export function toAsciiSlug(base: string): string {
  const tokens = base.match(TOKEN_RE) ?? [];
  const parts = tokens.map((run) => {
    if (CJK_CHAR.test(run)) {
      return pinyin(run, {
        toneType: "none",
        type: "string",
        separator: "",
        v: true, // ü -> v so the result stays in [a-z]
      })
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    }
    return run.toLowerCase();
  });

  return parts
    .filter(Boolean)
    .join("-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/g, "");
}

export const asciifyMediaFilename: CollectionBeforeOperationHook = ({
  operation,
  req,
}) => {
  if (operation !== "create" && operation !== "update") {
    return;
  }

  const file = req.file;
  if (!file?.name || !hasNonAscii(file.name)) {
    return;
  }

  const dot = file.name.lastIndexOf(".");
  const rawExt = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "";
  const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "";
  const base = dot > 0 ? file.name.slice(0, dot) : file.name;

  const slug = toAsciiSlug(base) || "media";
  // Short random suffix: avoids overwriting an existing R2 key when two
  // uploads transliterate to the same slug (e.g. homophones).
  const suffix = Math.random().toString(36).slice(2, 8);
  const name = ext ? `${slug}-${suffix}.${ext}` : `${slug}-${suffix}`;

  req.file = { ...file, name };
};
