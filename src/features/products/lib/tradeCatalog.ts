export const TRADE_SIZES = [
  "800X2600mm",
  "900X2700mm",
  "900X3000mm",
  "900X1800mm",
  "1000X3000mm",
  "1200X2400mm",
  "1200X2700mm",
  "1200X3200mm",
  "1600X3200mm",
] as const;

export type TradeSize = (typeof TRADE_SIZES)[number];

export const TRADE_THICKNESSES = ["3mm", "6mm", "9mm", "12mm", "15mm"] as const;

export type TradeThickness = (typeof TRADE_THICKNESSES)[number];

export const TRADE_PROCESSES = [
  "亮光",
  "哑光",
  "亮面(奢石釉)",
  "真石镜面釉",
  "肌肤釉",
  "透光石",
  "高白",
  "数码模具面",
  "火烧面",
  "精雕",
  "复刻釉",
  "定位彩晶",
] as const;

export type TradeProcess = (typeof TRADE_PROCESSES)[number];

export const TRADE_SERIES_TYPES = [
  "质感岩板",
  "名石岩板",
  "洞石岩板",
  "木纹岩板",
  "护墙岩板",
  "艺术岩板",
  "连纹岩板",
  "创意网红",
] as const;

export type TradeSeriesType = (typeof TRADE_SERIES_TYPES)[number];

export const TRADE_COLOR_GROUPS = [
  "白色",
  "米白",
  "黑色",
  "灰色",
  "米黄",
  "棕色",
  "金黄色",
  "素色",
  "蓝色",
  "绿色",
  "紫色",
  "红色",
] as const;

export type TradeColorGroup = (typeof TRADE_COLOR_GROUPS)[number];

const EXPLICIT_SIZE_PATTERNS: Array<{ size: TradeSize; patterns: RegExp[] }> = [
  { size: "1600X3200mm", patterns: [/1600x3200/, /1632x(?:9|12|15)/] },
  { size: "1200X3200mm", patterns: [/1200x3200/, /1232x9/, /1232/] },
  { size: "1200X2700mm", patterns: [/1200x2700/, /1227x(?:9|12)/] },
  { size: "1200X2400mm", patterns: [/1200x2400/, /1224x(?:9|12)/] },
  { size: "1000X3000mm", patterns: [/1000x3000/, /1030/] },
  { size: "900X3000mm", patterns: [/900x3000/, /900x300x9/, /930x9/, /930/] },
  { size: "900X2700mm", patterns: [/900x2700/, /900x270x9m/, /927x9/, /927/] },
  { size: "900X1800mm", patterns: [/900x1800/, /918/] },
  { size: "800X2600mm", patterns: [/800x2600/, /826x(?:9|15)/, /826/] },
];

const PROCESS_PATTERNS: Array<{ value: TradeProcess; patterns: RegExp[] }> = [
  { value: "亮面(奢石釉)", patterns: [/奢石釉/] },
  { value: "真石镜面釉", patterns: [/真石镜面釉/, /真石镜面-亮面/, /真石镜面/] },
  { value: "哑光", patterns: [/超细干粒/, /细哑面/, /哑光/, /哑面/, /磨砂面/] },
  { value: "透光石", patterns: [/透光石/] },
  { value: "定位彩晶", patterns: [/定位彩晶/] },
  { value: "肌肤釉", patterns: [/柔光肌肤釉/, /天鹅绒肌肤釉/, /肌肤釉/] },
  { value: "高白", patterns: [/高白/] },
  { value: "数码模具面", patterns: [/数码模具面/, /数码磨具面/] },
  { value: "火烧面", patterns: [/火烧面/] },
  { value: "精雕", patterns: [/精雕/] },
  { value: "复刻釉", patterns: [/复刻/] },
  {
    value: "亮光",
    patterns: [/干粒抛亮光/, /亮光/, /亮面/, /镜面/],
  },
];

const FACE_PATTERNS = [
  "ABCD四面上下左右连",
  "ABCD四面",
  "上下左右无限连纹",
  "无限连纹",
  "一石多面",
  "一石面",
  "单面",
  "左右连",
] as const;

const FACE_COUNT_PATTERNS: Array<{ value: string; patterns: RegExp[] }> = [
  { value: "四面", patterns: [/abcd四面/, /四面/] },
  { value: "多面", patterns: [/一石多面/] },
  { value: "单面", patterns: [/单面/, /一石面/] },
];

function normalizeSource(input: string): string {
  return input
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/\s+/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")");
}

export function inferTradeSize(input: string): TradeSize | null {
  const normalized = normalizeSource(input);

  for (const entry of EXPLICIT_SIZE_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(normalized))) {
      return entry.size;
    }
  }

  return null;
}

export function inferTradeThickness(input: string): TradeThickness | null {
  const normalized = normalizeSource(input);
  const matched = normalized.match(/x(3|6|9|12|15)mm/u);

  if (!matched) {
    return null;
  }

  const thickness = `${matched[1]}mm`;

  return TRADE_THICKNESSES.includes(thickness as TradeThickness)
    ? (thickness as TradeThickness)
    : null;
}

export function inferTradeColorGroup(input: string): TradeColorGroup | null {
  const normalized = input.replace(/\s+/g, "");
  const matches = new Set<TradeColorGroup>();

  if (/米白|奶白/.test(normalized)) {
    matches.add("米白");
  }

  if (/米黄|奶黄|黄洞石/.test(normalized)) {
    matches.add("米黄");
  }

  if (/金黄|黄金/.test(normalized)) {
    matches.add("金黄色");
  }

  if (/棕|咖/.test(normalized)) {
    matches.add("棕色");
  }

  if (/蓝/.test(normalized)) {
    matches.add("蓝色");
  }

  if (/绿|翡翠/.test(normalized)) {
    matches.add("绿色");
  }

  if (/紫/.test(normalized)) {
    matches.add("紫色");
  }

  if (/红/.test(normalized)) {
    matches.add("红色");
  }

  if (/黑/.test(normalized)) {
    matches.add("黑色");
  }

  if (/灰|银灰/.test(normalized)) {
    matches.add("灰色");
  }

  if (!matches.has("米白") && /白|雪/.test(normalized)) {
    matches.add("白色");
  }

  if (matches.size !== 1) {
    return null;
  }

  return [...matches][0];
}

export function normalizeTradeProcess(input: string): TradeProcess | null {
  const normalized = normalizeSource(input);

  for (const entry of PROCESS_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(normalized))) {
      return entry.value;
    }
  }

  return null;
}

export function extractTradeFaceMetadata(input: string): {
  faceCount: string | null;
  facePatternNote: string | null;
} {
  const source = input.replace(/_/g, "").replace(/\s+/g, "");
  const matchedPattern = FACE_PATTERNS.find((pattern) => source.includes(pattern)) ?? null;
  const faceCount =
    FACE_COUNT_PATTERNS.find((entry) =>
      entry.patterns.some((pattern) => pattern.test(source))
    )?.value ?? null;

  return {
    faceCount,
    facePatternNote: matchedPattern,
  };
}

function stripExtension(input: string): string {
  return input.replace(/\.[^.]+$/u, "");
}

function stripTrailingViewMarkers(input: string): string {
  return input
    .replace(/[_-]view\d+$/iu, "")
    .replace(/[_-]\d+$/u, "");
}

function stripCodes(input: string): string {
  return input
    .replace(
      /(?:^|[\s_-])((?:ZL|LV|ZF|ZH|TT|TG|GA|MK|ZS|LD|E\d+SM)[A-Z0-9-]*)(?=[\u4E00-\u9FFF]|[\s_-]|$)/giu,
      " "
    )
    .replace(
      /^((?:ZL|LV|ZF|ZH|TT|TG|GA|MK|ZS|LD|E\d+SM)[A-Z0-9-]*)(?=[\u4E00-\u9FFF])/iu,
      ""
    );
}

function stripFaceNotes(input: string): string {
  return input
    .replace(/-?ABCD四面上下左右连/giu, "")
    .replace(/-?ABCD四面/giu, "")
    .replace(/-?上下左右无限连纹/giu, "")
    .replace(/-?无限连纹/giu, "")
    .replace(/-?一石多面/giu, "")
    .replace(/-?一石面/giu, "")
    .replace(/-?单面/giu, "")
    .replace(/-?左右连/giu, "");
}

export function extractTradeDisplayName(input: string): string | null {
  const basename = input.split("/").pop() ?? input;

  const cleaned = stripFaceNotes(stripCodes(stripTrailingViewMarkers(stripExtension(basename))))
    .replace(/[()（）[\]]/gu, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}

export function extractTradeCode(input: string): string | null {
  const basename = stripExtension(input.split("/").pop() ?? input);
  const directMatch = basename.match(
    /((?:ZYL|ZL|ZF|ZH|ZS|LV|TT|TG|GA|MK|LD|CJ|FK|NL|SM|E\d+SM|V(?=\d)|Z(?=[0-9]))[A-Z0-9-]*)/iu
  );

  return directMatch?.[1] ?? null;
}
