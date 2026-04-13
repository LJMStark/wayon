import assert from "node:assert/strict";
import test from "node:test";

import {
  extractTradeCode,
  extractTradeDisplayName,
  extractTradeFaceMetadata,
  inferTradeSize,
  normalizeTradeProcess,
} from "./tradeCatalog.ts";

test("inferTradeSize infers size from code aliases and explicit folder names", () => {
  assert.equal(
    inferTradeSize("众岩联--产品效果图/930x9/亮光/A类/LV930L902维多利亚.jpg"),
    "900X3000mm"
  );
  assert.equal(
    inferTradeSize("众岩联--元素图整理/900X270X9M系列/亮面/B类亮面带S/ZL927L060S芬迪白.jpg"),
    "900X2700mm"
  );
  assert.equal(
    inferTradeSize("众岩联--元素图整理/1600x3200x12mm系列/亮光/ZL1632L1232卡拉拉白.jpg"),
    "1600X3200mm"
  );
});

test("normalizeTradeProcess maps known aliases to fixed process labels", () => {
  assert.equal(normalizeTradeProcess("亮面   飘窗+楼梯台面应用"), "亮光");
  assert.equal(normalizeTradeProcess("C类 哑光细哑面"), "哑光");
  assert.equal(normalizeTradeProcess("复刻时光釉"), "复刻釉");
  assert.equal(normalizeTradeProcess("天鹅绒肌肤釉"), "肌肤釉");
  assert.equal(normalizeTradeProcess("复合柔抛"), "柔抛石材光");
  assert.equal(normalizeTradeProcess("无法识别工艺"), null);
});

test("extractTradeFaceMetadata extracts face count and keeps pattern note", () => {
  assert.deepEqual(
    extractTradeFaceMetadata("ZL1030L901维多利亚-ABCD四面上下左右连.jpg"),
    {
      faceCount: "四面",
      facePatternNote: "ABCD四面上下左右连",
    }
  );

  assert.deepEqual(
    extractTradeFaceMetadata("纯白 ZL927S043 单面.jpg"),
    {
      faceCount: "单面",
      facePatternNote: "单面",
    }
  );

  assert.deepEqual(
    extractTradeFaceMetadata("ZL927L070S左右连-化石黑.jpg"),
    {
      faceCount: null,
      facePatternNote: "左右连",
    }
  );
});

test("extractTradeDisplayName strips codes, suffix markers and extensions", () => {
  assert.equal(extractTradeDisplayName("LV930L902维多利亚.jpg"), "维多利亚");
  assert.equal(
    extractTradeDisplayName("ZL1030L901维多利亚-ABCD四面上下左右连.jpg"),
    "维多利亚"
  );
  assert.equal(
    extractTradeDisplayName("洛可可卡其 ZF120-005一石面.jpg"),
    "洛可可卡其"
  );
});

test("extractTradeCode extracts the stable product code from common naming styles", () => {
  assert.equal(extractTradeCode("LV930L902维多利亚.jpg"), "LV930L902");
  assert.equal(
    extractTradeCode("ZL1030L901维多利亚-ABCD四面上下左右连.jpg"),
    "ZL1030L901"
  );
  assert.equal(extractTradeCode("洛可可卡其 ZF120-005一石面.jpg"), "ZF120-005");
});
