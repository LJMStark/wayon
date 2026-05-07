import { pinyin } from "pinyin-pro";

import type { AppLocale } from "@/i18n/types";

export type LocalizedProductTitle = Partial<Record<AppLocale, string>> & {
  zh?: string;
};

export function hasChineseText(value: string | undefined): boolean {
  return Boolean(value && /[\u3400-\u9fff]/.test(value));
}

export function stripLeadingProductCode(value: string): string {
  return value
    .trim()
    .replace(/^[A-Z]{1,5}\d[A-Z0-9-]*(?:\s+|(?=[\u3400-\u9fff]))/u, "")
    .trim();
}

export function toUppercasePinyin(value: string): string {
  return pinyin(value, {
    toneType: "none",
    type: "string",
    nonZh: "consecutive",
    separator: " ",
  })
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function usableNonChineseTitle(value: string | undefined): string {
  const title = value ? stripLeadingProductCode(value) : "";

  return title && !hasChineseText(title) ? title : "";
}

export function getLocalizedProductTitleDisplay(
  title: LocalizedProductTitle | undefined,
  locale: AppLocale,
  fallback = ""
): string {
  if (locale === "zh") {
    return (
      stripLeadingProductCode(title?.zh ?? "") ||
      usableNonChineseTitle(title?.en) ||
      fallback
    );
  }

  const chineseTitle = stripLeadingProductCode(title?.zh ?? "");

  if (chineseTitle) {
    return toUppercasePinyin(chineseTitle);
  }

  return (
    usableNonChineseTitle(title?.[locale]) ||
    usableNonChineseTitle(title?.en) ||
    fallback
  );
}
