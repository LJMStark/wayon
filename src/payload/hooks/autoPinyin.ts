import type { CollectionAfterChangeHook } from "payload";

import {
  hasChineseText,
  stripLeadingProductCode,
  toUppercasePinyin,
} from "../../data/productTitle.ts";

// When the zh locale of a product title is saved, auto-fill EN/ES/AR title
// with uppercase pinyin — per client spec, all product names use pinyin on
// non-Chinese pages. Runs only on zh saves to avoid update loops.
export const autoPinyinTitleAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  if (req.locale !== "zh") return;

  const zhTitle =
    typeof doc.title === "string"
      ? doc.title
      : (doc.title as Record<string, string> | undefined)?.zh;

  if (!zhTitle || !hasChineseText(zhTitle)) return;

  const pinyinTitle = toUppercasePinyin(stripLeadingProductCode(zhTitle));
  if (!pinyinTitle) return;

  for (const locale of ["en", "es", "ar"] as const) {
    await req.payload.update({
      collection: "products",
      id: doc.id as string,
      locale,
      data: { title: pinyinTitle },
      overrideAccess: true,
      req,
    });
  }
};
