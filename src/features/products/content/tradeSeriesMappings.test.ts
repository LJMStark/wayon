import assert from "node:assert/strict";
import test from "node:test";

import { inferTradeSeriesTypes } from "./tradeSeriesMappings.ts";

test("inferTradeSeriesTypes keeps high-confidence mappings only", () => {
  assert.deepEqual(
    inferTradeSeriesTypes({
      displayName: "白洞石",
      process: "哑光",
      facePatternNote: null,
    }),
    ["洞石岩板"]
  );

  assert.deepEqual(
    inferTradeSeriesTypes({
      displayName: "卡尔德拉原木",
      process: "哑光",
      facePatternNote: "左右连",
    }).sort(),
    ["木纹岩板", "连纹岩板"].sort()
  );

  assert.deepEqual(
    inferTradeSeriesTypes({
      displayName: "金风玉露",
      process: "透光石",
      facePatternNote: null,
    }),
    ["艺术岩板"]
  );
});
