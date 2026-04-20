import { expect, test } from "vitest";

import { inferTradeSeriesTypes } from "./tradeSeriesMappings.ts";

test("inferTradeSeriesTypes keeps high-confidence mappings only", () => {
  expect(inferTradeSeriesTypes({
      displayName: "白洞石",
      process: "哑光",
      facePatternNote: null,
    })).toEqual(["洞石岩板"]);

  expect(inferTradeSeriesTypes({
      displayName: "卡尔德拉原木",
      process: "哑光",
      facePatternNote: "左右连",
    }).sort()).toEqual(["木纹岩板", "连纹岩板"].sort());

  expect(inferTradeSeriesTypes({
      displayName: "金风玉露",
      process: "透光石",
      facePatternNote: null,
    })).toEqual(["艺术岩板"]);
});
