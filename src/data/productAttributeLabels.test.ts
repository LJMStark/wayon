import { expect, test } from "vitest";

import {
  localizeColorGroup,
  localizeColorGroupOptions,
  localizeProcess,
  localizeProcessOptions,
  localizeSeriesType,
} from "./productAttributeLabels";

test("catalog attribute labels do not use Chinese keys as fallback outside Chinese", () => {
  expect(localizeProcess("未知工艺", "en")).toBeUndefined();
  expect(localizeColorGroup("未知颜色", "es")).toBeUndefined();
  expect(localizeSeriesType("未知系列", "ar")).toBeUndefined();

  expect(localizeProcess("未知工艺", "zh")).toBe("未知工艺");
});

test("catalog option helpers remove unknown Chinese labels outside Chinese", () => {
  expect(localizeProcessOptions(["亮光", "未知工艺"], "en")).toEqual([
    "High gloss",
  ]);
  expect(localizeColorGroupOptions(["白色", "未知颜色"], "es")).toEqual([
    "Blanco",
  ]);
});
