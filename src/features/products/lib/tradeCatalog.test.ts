import { expect, test } from "vitest";

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
  expect(inferTradeSize("众岩联--产品效果图/930x9/亮光/A类/LV930L902维多利亚.jpg")).toBe("900X3000mm");
  expect(inferTradeSize("众岩联--元素图整理/900X270X9M系列/亮面/B类亮面带S/ZL927L060S芬迪白.jpg")).toBe("900X2700mm");
  expect(inferTradeSize("众岩联--元素图整理/1600x3200x12mm系列/亮光/ZL1632L1232卡拉拉白.jpg")).toBe("1600X3200mm");
});

test("normalizeTradeProcess maps known aliases to fixed process labels", () => {
  expect(normalizeTradeProcess("亮面   飘窗+楼梯台面应用")).toBe("亮光");
  expect(normalizeTradeProcess("C类 哑光细哑面")).toBe("哑光");
  expect(normalizeTradeProcess("复刻时光釉")).toBe("复刻釉");
  expect(normalizeTradeProcess("天鹅绒肌肤釉")).toBe("肌肤釉");
  expect(normalizeTradeProcess("复合柔抛")).toBe(null);
  expect(normalizeTradeProcess("真石镜面釉-亮光")).toBe("真石镜面釉");
  expect(normalizeTradeProcess("亮面（奢石釉）")).toBe("亮面(奢石釉)");
  expect(normalizeTradeProcess("哑光（超细干粒）")).toBe("哑光");
  expect(normalizeTradeProcess("无法识别工艺")).toBe(null);
});

test("inferTradeThickness extracts thickness from dimension folders", () => {
  expect(inferTradeThickness("产品/众岩联标准素材集合/新品素材集合/1600X3200X12mm/真石镜面釉-亮光")).toBe("12mm");
  expect(inferTradeThickness("产品/众岩联标准素材集合/新品素材集合/800×2600×9mm/亮光")).toBe("9mm");
  expect(inferTradeThickness("产品/众岩联标准素材集合/新品素材集合/1200X2400")).toBe(null);
});

test("extractTradeFaceMetadata extracts face count and keeps pattern note", () => {
  expect(extractTradeFaceMetadata("ZL1030L901维多利亚-ABCD四面上下左右连.jpg")).toEqual({
      faceCount: "四面",
      facePatternNote: "ABCD四面上下左右连",
    });

  expect(extractTradeFaceMetadata("纯白 ZL927S043 单面.jpg")).toEqual({
      faceCount: "单面",
      facePatternNote: "单面",
    });

  expect(extractTradeFaceMetadata("ZL927L070S左右连-化石黑.jpg")).toEqual({
      faceCount: null,
      facePatternNote: "左右连",
    });
});

test("extractTradeDisplayName strips codes, suffix markers and extensions", () => {
  expect(extractTradeDisplayName("LV930L902维多利亚.jpg")).toBe("维多利亚");
  expect(extractTradeDisplayName("ZL1030L901维多利亚-ABCD四面上下左右连.jpg")).toBe("维多利亚");
  expect(extractTradeDisplayName("洛可可卡其 ZF120-005一石面.jpg")).toBe("洛可可卡其");
});

test("extractTradeCode extracts the stable product code from common naming styles", () => {
  expect(extractTradeCode("LV930L902维多利亚.jpg")).toBe("LV930L902");
  expect(extractTradeCode("ZL1030L901维多利亚-ABCD四面上下左右连.jpg")).toBe("ZL1030L901");
  expect(extractTradeCode("洛可可卡其 ZF120-005一石面.jpg")).toBe("ZF120-005");
});

test("inferTradeColorGroup maps explicit high-confidence color phrases", () => {
  expect(inferTradeColorGroup("洛可可奶白")).toBe("米白");
  expect(inferTradeColorGroup("罗马黄洞石")).toBe("米黄");
  expect(inferTradeColorGroup("珍珠黑")).toBe("黑色");
  expect(inferTradeColorGroup("欧米茄灰")).toBe("灰色");
  expect(inferTradeColorGroup("威尼斯棕")).toBe("棕色");
  expect(inferTradeColorGroup("碧海珈蓝")).toBe("蓝色");
  expect(inferTradeColorGroup("冷翡翠")).toBe("绿色");
  expect(inferTradeColorGroup("皇家宝格丽红")).toBe("红色");
  expect(inferTradeColorGroup("宝格丽紫")).toBe("紫色");
  expect(inferTradeColorGroup("纯白")).toBe("白色");
});

test("inferTradeColorGroup returns null for ambiguous mixed colors", () => {
  expect(inferTradeColorGroup("黑白根")).toBe(null);
  expect(inferTradeColorGroup("云棕灰")).toBe(null);
  expect(inferTradeColorGroup("蓝翡翠")).toBe(null);
  expect(inferTradeColorGroup("莫奈花园")).toBe(null);
});
