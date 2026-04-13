import type { AppLocale } from "@/i18n/types";
import type {
  TradeProcess,
  TradeColorGroup,
} from "@/features/products/lib/tradeCatalog";

type LocalizedLabel = Record<AppLocale, string>;

// ---------------------------------------------------------------------------
// Process (surface finish)
// ---------------------------------------------------------------------------

const PROCESS_LABELS: Record<TradeProcess, LocalizedLabel> = {
  "亮光": {
    en: "Polished",
    zh: "亮光",
    es: "Pulido",
    ar: "لامع",
    ru: "Полировка",
  },
  "哑光": {
    en: "Matte",
    zh: "哑光",
    es: "Mate",
    ar: "مطفي",
    ru: "Матовый",
  },
  "复刻釉": {
    en: "Retro Glaze",
    zh: "复刻釉",
    es: "Esmalte retro",
    ar: "طلاء ريترو",
    ru: "Ретро-глазурь",
  },
  "下线釉": {
    en: "Line Glaze",
    zh: "下线釉",
    es: "Esmalte de línea",
    ar: "طلاء خطي",
    ru: "Линейная глазурь",
  },
  "肌肤釉": {
    en: "Skin-Touch Glaze",
    zh: "肌肤釉",
    es: "Esmalte tacto piel",
    ar: "طلاء ناعم",
    ru: "Глазурь «шёлк»",
  },
  "胶水干粒": {
    en: "Dry Granule",
    zh: "胶水干粒",
    es: "Gránulo seco",
    ar: "حبيبات جافة",
    ru: "Сухие гранулы",
  },
  "定位彩晶": {
    en: "Color Crystal",
    zh: "定位彩晶",
    es: "Cristal color",
    ar: "كريستال ملون",
    ru: "Цветной кристалл",
  },
  "透光石": {
    en: "Translucent",
    zh: "透光石",
    es: "Translúcido",
    ar: "شبه شفاف",
    ru: "Полупрозрачный",
  },
  "柔抛石材光": {
    en: "Soft Polish",
    zh: "柔抛石材光",
    es: "Pulido suave",
    ar: "تلميع ناعم",
    ru: "Мягкая полировка",
  },
};

// ---------------------------------------------------------------------------
// Color group
// ---------------------------------------------------------------------------

const COLOR_GROUP_LABELS: Record<TradeColorGroup, LocalizedLabel> = {
  "白色": {
    en: "White",
    zh: "白色",
    es: "Blanco",
    ar: "أبيض",
    ru: "Белый",
  },
  "米白": {
    en: "Cream White",
    zh: "米白",
    es: "Blanco crema",
    ar: "أبيض كريمي",
    ru: "Кремово-белый",
  },
  "黑色": {
    en: "Black",
    zh: "黑色",
    es: "Negro",
    ar: "أسود",
    ru: "Чёрный",
  },
  "灰色": {
    en: "Grey",
    zh: "灰色",
    es: "Gris",
    ar: "رمادي",
    ru: "Серый",
  },
  "米黄": {
    en: "Beige",
    zh: "米黄",
    es: "Beige",
    ar: "بيج",
    ru: "Бежевый",
  },
  "棕色": {
    en: "Brown",
    zh: "棕色",
    es: "Marrón",
    ar: "بني",
    ru: "Коричневый",
  },
  "金黄色": {
    en: "Gold",
    zh: "金黄色",
    es: "Dorado",
    ar: "ذهبي",
    ru: "Золотой",
  },
  "素色": {
    en: "Solid",
    zh: "素色",
    es: "Sólido",
    ar: "سادة",
    ru: "Однотонный",
  },
  "蓝色": {
    en: "Blue",
    zh: "蓝色",
    es: "Azul",
    ar: "أزرق",
    ru: "Синий",
  },
  "绿色": {
    en: "Green",
    zh: "绿色",
    es: "Verde",
    ar: "أخضر",
    ru: "Зелёный",
  },
  "紫色": {
    en: "Purple",
    zh: "紫色",
    es: "Púrpura",
    ar: "أرجواني",
    ru: "Фиолетовый",
  },
  "红色": {
    en: "Red",
    zh: "红色",
    es: "Rojo",
    ar: "أحمر",
    ru: "Красный",
  },
};

// ---------------------------------------------------------------------------
// Series type
// ---------------------------------------------------------------------------

const SERIES_TYPE_LABELS: Record<string, LocalizedLabel> = {
  "质感岩板": {
    en: "Texture Slab",
    zh: "质感岩板",
    es: "Losa textura",
    ar: "ألواح ملمسية",
    ru: "Текстурная плита",
  },
  "名石岩板": {
    en: "Classic Stone Slab",
    zh: "名石岩板",
    es: "Losa piedra clásica",
    ar: "ألواح الحجر الكلاسيكي",
    ru: "Плита \"классический камень\"",
  },
  "洞石岩板": {
    en: "Travertine Slab",
    zh: "洞石岩板",
    es: "Losa travertino",
    ar: "ألواح الترافرتين",
    ru: "Травертиновая плита",
  },
  "木纹岩板": {
    en: "Wood-Grain Slab",
    zh: "木纹岩板",
    es: "Losa veta de madera",
    ar: "ألواح نمط الخشب",
    ru: "Плита \"дерево\"",
  },
  "护墙岩板": {
    en: "Wall Cladding Slab",
    zh: "护墙岩板",
    es: "Losa revestimiento",
    ar: "ألواح تكسية الجدران",
    ru: "Стеновая плита",
  },
  "艺术岩板": {
    en: "Art Slab",
    zh: "艺术岩板",
    es: "Losa artística",
    ar: "ألواح فنية",
    ru: "Арт-плита",
  },
  "连纹岩板": {
    en: "Continuous-Vein Slab",
    zh: "连纹岩板",
    es: "Losa veta continua",
    ar: "ألواح النمط المتصل",
    ru: "Плита со сквозным рисунком",
  },
  "创意网红": {
    en: "Trending Design",
    zh: "创意网红",
    es: "Diseño tendencia",
    ar: "تصميم رائج",
    ru: "Трендовый дизайн",
  },
};

// ---------------------------------------------------------------------------
// Face count
// ---------------------------------------------------------------------------

const FACE_COUNT_LABELS: Record<string, LocalizedLabel> = {
  "四面": {
    en: "4 Faces",
    zh: "四面",
    es: "4 caras",
    ar: "4 أوجه",
    ru: "4 грани",
  },
  "多面": {
    en: "Multi-Face",
    zh: "多面",
    es: "Múltiples caras",
    ar: "متعدد الأوجه",
    ru: "Много граней",
  },
  "单面": {
    en: "Single Face",
    zh: "单面",
    es: "1 cara",
    ar: "وجه واحد",
    ru: "1 грань",
  },
};

// ---------------------------------------------------------------------------
// Face pattern note
// ---------------------------------------------------------------------------

const FACE_PATTERN_NOTE_LABELS: Record<string, LocalizedLabel> = {
  "ABCD四面上下左右连": {
    en: "ABCD 4-side continuous",
    zh: "ABCD四面上下左右连",
    es: "ABCD continuo 4 lados",
    ar: "ABCD متصل من 4 جوانب",
    ru: "ABCD непрерывный с 4 сторон",
  },
  "ABCD四面": {
    en: "ABCD 4-face",
    zh: "ABCD四面",
    es: "ABCD 4 caras",
    ar: "ABCD أربعة أوجه",
    ru: "ABCD 4 грани",
  },
  "上下左右无限连纹": {
    en: "Infinite continuous vein",
    zh: "上下左右无限连纹",
    es: "Veta continua infinita",
    ar: "نمط متصل بلا حدود",
    ru: "Бесконечный сквозной рисунок",
  },
  "无限连纹": {
    en: "Continuous vein",
    zh: "无限连纹",
    es: "Veta continua",
    ar: "نمط متصل",
    ru: "Сквозной рисунок",
  },
  "一石多面": {
    en: "Multi-face per slab",
    zh: "一石多面",
    es: "Múltiples caras por losa",
    ar: "متعدد الأوجه لكل لوح",
    ru: "Несколько граней на плиту",
  },
  "一石面": {
    en: "Single face slab",
    zh: "一石面",
    es: "Losa una cara",
    ar: "لوح وجه واحد",
    ru: "Одна грань на плиту",
  },
  "单面": {
    en: "Single face",
    zh: "单面",
    es: "Una cara",
    ar: "وجه واحد",
    ru: "Одна грань",
  },
  "左右连": {
    en: "Left-right continuous",
    zh: "左右连",
    es: "Continuo izquierda-derecha",
    ar: "متصل يمين-يسار",
    ru: "Горизонтальная непрерывность",
  },
};

// ---------------------------------------------------------------------------
// Media-section fallback alt text
// ---------------------------------------------------------------------------

const MEDIA_ALT_SUFFIXES: Record<string, LocalizedLabel> = {
  element: {
    en: "element view",
    zh: "元素图",
    es: "vista de elemento",
    ar: "صورة العنصر",
    ru: "элемент",
  },
  space: {
    en: "space view",
    zh: "空间图",
    es: "vista de espacio",
    ar: "صورة المساحة",
    ru: "интерьер",
  },
  real: {
    en: "real photo",
    zh: "实拍图",
    es: "foto real",
    ar: "صورة حقيقية",
    ru: "фото",
  },
  video: {
    en: "video",
    zh: "视频",
    es: "video",
    ar: "فيديو",
    ru: "видео",
  },
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

function lookupLabel(
  table: Record<string, LocalizedLabel>,
  key: string,
  locale: AppLocale
): string {
  return table[key]?.[locale] ?? table[key]?.en ?? key;
}

export function localizeProcess(
  value: string | undefined,
  locale: AppLocale
): string | undefined {
  if (!value) return undefined;
  return lookupLabel(PROCESS_LABELS, value, locale);
}

export function localizeColorGroup(
  value: string | undefined,
  locale: AppLocale
): string | undefined {
  if (!value) return undefined;
  return lookupLabel(COLOR_GROUP_LABELS, value, locale);
}

export function localizeSeriesType(
  value: string,
  locale: AppLocale
): string {
  return lookupLabel(SERIES_TYPE_LABELS, value, locale);
}

export function localizeFaceCount(
  value: string | undefined,
  locale: AppLocale
): string | undefined {
  if (!value) return undefined;
  return lookupLabel(FACE_COUNT_LABELS, value, locale);
}

export function localizeFacePatternNote(
  value: string | undefined,
  locale: AppLocale
): string | undefined {
  if (!value) return undefined;
  return lookupLabel(FACE_PATTERN_NOTE_LABELS, value, locale);
}

export function localizeMediaAlt(
  title: string,
  mediaType: "element" | "space" | "real" | "video",
  locale: AppLocale
): string {
  const suffix = MEDIA_ALT_SUFFIXES[mediaType]?.[locale] ?? mediaType;
  return `${title} - ${suffix}`;
}

/**
 * Localize all filter-button labels that appear in the product directory.
 * Returns a new array with each value translated for the given locale.
 */
export function localizeProcessOptions(
  options: string[],
  locale: AppLocale
): string[] {
  return options.map((value) => lookupLabel(PROCESS_LABELS, value, locale));
}

export function localizeColorGroupOptions(
  options: string[],
  locale: AppLocale
): string[] {
  return options.map((value) => lookupLabel(COLOR_GROUP_LABELS, value, locale));
}

export function localizeSeriesTypeOptions(
  options: string[],
  locale: AppLocale
): string[] {
  return options.map((value) => lookupLabel(SERIES_TYPE_LABELS, value, locale));
}
