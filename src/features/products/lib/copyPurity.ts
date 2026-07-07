// 4-locale copy purity gate shared by the description backfill scripts
// (scripts/applyHaikuDrafts.mjs, scripts/fillDescriptionsSQL.mjs). It decides
// which AI-generated copy is allowed into production product rows, so both
// scripts must agree on the rules — keep the logic here, not in the scripts.

export const COPY_PURITY_LOCALES = ["zh", "en", "es", "ar"] as const;

const MIN_COPY_LENGTH = 10;

// Han ideographs (URO + Extension A) — the "zh must contain Chinese" check.
const HAN_RE = /[一-鿿㐀-䶿]/;
// Contamination check for non-zh locales: any Han ideograph OR CJK/fullwidth
// punctuation. "Hello，world" must not pass as clean English — the fullwidth
// comma is a Chinese-IME artifact even when every letter is Latin.
const CJK_PUNCT_RE = /[、-】！（），：；？]/;
const ARABIC_RE = /[؀-ۿ]/;

export const hasHan = (s: unknown): boolean => HAN_RE.test(String(s ?? ""));

export const hasCJKContamination = (s: unknown): boolean => {
  const v = String(s ?? "");
  return HAN_RE.test(v) || CJK_PUNCT_RE.test(v);
};

export const hasArabic = (s: unknown): boolean => ARABIC_RE.test(String(s ?? ""));

export type CopyDraft = Partial<Record<(typeof COPY_PURITY_LOCALES)[number], unknown>>;

// Returns null when the draft passes, otherwise a short reason string.
// Reason format is kept compatible with the backfill scripts' log output.
export function validateCopyPurity(draft: CopyDraft): string | null {
  for (const locale of COPY_PURITY_LOCALES) {
    const value = draft[locale];
    if (!value || String(value).trim().length < MIN_COPY_LENGTH) {
      return `${locale}空/过短`;
    }
  }
  if (!hasHan(draft.zh)) return "zh无中文";
  for (const locale of ["en", "es", "ar"] as const) {
    if (hasCJKContamination(draft[locale])) return `${locale}混中文`;
  }
  if (!hasArabic(draft.ar)) return "ar非阿拉伯文";
  return null;
}
