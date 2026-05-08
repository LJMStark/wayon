import type { AppLocale } from "../../i18n/types.ts";

type GlossaryEntry = {
  zh: string;
  en: string;
  es: string;
  ar: string;
  notes?: string;
};

// Curated terminology for sintered-stone industry. Used as part of the system
// prompt to keep the LLM from inventing translations like "rock board" for
// "岩板". Order matters in the prompt: longer / more specific entries first.
export const TRANSLATION_GLOSSARY: GlossaryEntry[] = [
  { zh: "岩板", en: "sintered stone", es: "piedra sinterizada", ar: "الحجر الملبد" },
  { zh: "瓷质岩板", en: "porcelain slab", es: "losa porcelánica", ar: "لوح بورسلان" },
  { zh: "亮光", en: "polished", es: "pulido", ar: "مصقول" },
  { zh: "哑光", en: "honed", es: "satinado", ar: "مصقول مطفأ" },
  { zh: "皮纹", en: "leathered", es: "acabado piel", ar: "ملمس جلدي" },
  { zh: "拉丝", en: "brushed", es: "cepillado", ar: "مفروش" },
  { zh: "喷砂", en: "sandblasted", es: "arenado", ar: "مرشوش بالرمل" },
  { zh: "大板", en: "large slab", es: "losa de gran formato", ar: "لوح كبير" },
  { zh: "大理石纹", en: "marble look", es: "efecto mármol", ar: "بتأثير الرخام" },
  { zh: "木纹", en: "wood look", es: "efecto madera", ar: "بتأثير الخشب" },
  { zh: "洞石", en: "travertine look", es: "efecto travertino", ar: "بتأثير الترافرتين" },
  { zh: "护墙", en: "wall cladding", es: "revestimiento mural", ar: "كسوة جدارية" },
  { zh: "台面", en: "countertop", es: "encimera", ar: "سطح" },
  { zh: "厨房台面", en: "kitchen countertop", es: "encimera de cocina", ar: "سطح مطبخ" },
  { zh: "背板", en: "backsplash", es: "salpicadero", ar: "لوح خلفي" },
  { zh: "全瓷", en: "full-body porcelain", es: "porcelánico de masa", ar: "بورسلان كامل الكتلة" },
  { zh: "众岩联", en: "ZYL Sintered Stone", es: "ZYL Sintered Stone", ar: "ZYL Sintered Stone" },
  { zh: "广东众岩联岩板科技有限公司", en: "Guangdong ZYL Sintered Stone Technology Co., Ltd.", es: "Guangdong ZYL Sintered Stone Technology Co., Ltd.", ar: "Guangdong ZYL Sintered Stone Technology Co., Ltd." },
  { zh: "佛山", en: "Foshan", es: "Foshan", ar: "فوشان" },
  { zh: "云浮", en: "Yunfu", es: "Yunfu", ar: "يوفنغ" },
];

const LOCALE_NAME: Record<AppLocale, string> = {
  zh: "Simplified Chinese",
  en: "English",
  es: "Spanish",
  ar: "Arabic",
};

const LOCALE_TONE: Record<AppLocale, string> = {
  zh: "professional B2B Chinese suitable for a building-materials company website",
  en: "professional B2B English suitable for an international building-materials company website",
  es: "profesional B2B en español neutro adecuado para una página corporativa de materiales de construcción",
  ar: "اللغة العربية الفصحى المهنية المناسبة لموقع شركة مواد بناء دولية",
};

export function buildGlossaryBlock(targetLocale: AppLocale): string {
  if (targetLocale === "zh") return "";
  const lines = TRANSLATION_GLOSSARY.map(
    (entry) => `- 「${entry.zh}」 → ${entry[targetLocale]}`
  );
  return `Domain glossary (Simplified Chinese → ${LOCALE_NAME[targetLocale]}). Use these terms verbatim:\n${lines.join("\n")}`;
}

export function buildSystemPrompt(targetLocale: AppLocale): string {
  return [
    `You are a professional translator for ZYL Sintered Stone, a Chinese B2B sintered-stone (建筑岩板) supplier targeting global buyers.`,
    `Translate user-supplied Simplified Chinese into ${LOCALE_NAME[targetLocale]}.`,
    `Tone: ${LOCALE_TONE[targetLocale]}.`,
    `Rules:`,
    `1. Translate meaning, not word-for-word. Keep marketing intent.`,
    `2. Preserve any markdown markers exactly: **bold**, *italic*, [text](url), inline code.`,
    `3. Do not add explanations, footnotes, or translator notes.`,
    `4. Do not translate inside URLs or product codes (sequences like "ZX12345").`,
    `5. Output only the translated text. No quoting, no preamble, no language tag.`,
    buildGlossaryBlock(targetLocale),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function getLocaleDisplayName(locale: AppLocale): string {
  return LOCALE_NAME[locale];
}
