import type { TradeProcess, TradeSeriesType } from "../lib/tradeCatalog";

type SeriesInferenceInput = {
  displayName: string;
  process?: TradeProcess | null;
  facePatternNote?: string | null;
};

const SERIES_RULES: Array<{
  seriesType: TradeSeriesType;
  patterns: RegExp[];
}> = [
  {
    seriesType: "洞石岩板",
    patterns: [/洞石/u, /莱姆石/u],
  },
  {
    seriesType: "木纹岩板",
    patterns: [/木化石/u, /白橡/u, /原木/u, /绸布/u, /木纹/u],
  },
  {
    seriesType: "质感岩板",
    patterns: [/水磨石/u, /水泥/u, /砂岩/u],
  },
];

export function inferTradeSeriesTypes({
  displayName,
  process,
  facePatternNote,
}: SeriesInferenceInput): TradeSeriesType[] {
  const inferred = new Set<TradeSeriesType>();

  for (const rule of SERIES_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(displayName))) {
      inferred.add(rule.seriesType);
    }
  }

  if (facePatternNote?.includes("连")) {
    inferred.add("连纹岩板");
  }

  if (process === "透光石") {
    inferred.add("艺术岩板");
  }

  return [...inferred];
}
