import assert from "node:assert/strict";
import test from "node:test";

import {
  extractTradeCode,
  extractTradeDisplayName,
  extractTradeFaceMetadata,
  inferTradeColorGroup,
  inferTradeSize,
  inferTradeThickness,
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
  assert.equal(normalizeTradeProcess("真石镜面釉-亮光"), "亮光");
  assert.equal(normalizeTradeProcess("亮面（奢石釉）"), "亮光");
  assert.equal(normalizeTradeProcess("哑光（超细干粒）"), "哑光");
  assert.equal(normalizeTradeProcess("无法识别工艺"), null);
});

test("inferTradeThickness extracts thickness from dimension folders", () => {
  assert.equal(
    inferTradeThickness("产品/众岩联标准素材集合/新品素材集合/1600X3200X12mm/真石镜面釉-亮光"),
    "12mm"
  );
  assert.equal(
    inferTradeThickness("产品/众岩联标准素材集合/新品素材集合/800×2600×9mm/亮光"),
    "9mm"
  );
  assert.equal(inferTradeThickness("产品/众岩联标准素材集合/新品素材集合/1200X2400"), null);
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

test("inferTradeColorGroup maps explicit high-confidence color phrases", () => {
  assert.equal(inferTradeColorGroup("洛可可奶白"), "米白");
  assert.equal(inferTradeColorGroup("罗马黄洞石"), "米黄");
  assert.equal(inferTradeColorGroup("珍珠黑"), "黑色");
  assert.equal(inferTradeColorGroup("欧米茄灰"), "灰色");
  assert.equal(inferTradeColorGroup("威尼斯棕"), "棕色");
  assert.equal(inferTradeColorGroup("碧海珈蓝"), "蓝色");
  assert.equal(inferTradeColorGroup("冷翡翠"), "绿色");
  assert.equal(inferTradeColorGroup("皇家宝格丽红"), "红色");
  assert.equal(inferTradeColorGroup("宝格丽紫"), "紫色");
  assert.equal(inferTradeColorGroup("纯白"), "白色");
});

test("inferTradeColorGroup returns null for ambiguous mixed colors", () => {
  assert.equal(inferTradeColorGroup("黑白根"), null);
  assert.equal(inferTradeColorGroup("云棕灰"), null);
  assert.equal(inferTradeColorGroup("蓝翡翠"), null);
  assert.equal(inferTradeColorGroup("莫奈花园"), null);
});
