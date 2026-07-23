import { expect, test } from "vitest";

import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SERIES_TYPES,
  TRADE_SIZES,
  TRADE_THICKNESSES,
} from "../lib/tradeCatalog";
import { CUSTOM_CAPABILITY_KEYS } from "../content/customCapabilities";
import {
  buildCatalogHref,
  resolveCatalogUrlSelection,
} from "./catalogUrl";

const CJK_TEXT_PATTERN = /[\u3400-\u9fff]/u;

test("buildCatalogHref emits one descriptive ASCII filter parameter", () => {
  expect(buildCatalogHref("color", "米白", "/en/products")).toBe(
    "/en/products?color=off-white"
  );
  expect(buildCatalogHref("series", "质感岩板", "/en/products")).toBe(
    "/en/products?series=texture-slab"
  );
  expect(buildCatalogHref("process", "亮面(奢石釉)", "/en/products")).toBe(
    "/en/products?process=luxury-stone-glaze"
  );
  expect(buildCatalogHref("color", null, "/en/products")).toBe(
    "/en/products?section=color"
  );
  expect(buildCatalogHref("thickness", "custom", "/en/products")).toBe(
    "/en/products?thickness=custom"
  );
  expect(
    buildCatalogHref("custom", "custom-pattern-design", "/en/products")
  ).toBe("/en/products?custom=custom-pattern-design");
});

test("every fixed catalog value has an ASCII URL identifier", () => {
  const valuesBySection = {
    size: TRADE_SIZES,
    series: TRADE_SERIES_TYPES,
    thickness: TRADE_THICKNESSES,
    color: TRADE_COLOR_GROUPS,
    process: TRADE_PROCESSES,
  } as const;

  for (const [section, values] of Object.entries(valuesBySection)) {
    for (const value of values) {
      const href = buildCatalogHref(
        section as keyof typeof valuesBySection,
        value,
        "/en/products"
      );

      expect(href).not.toMatch(CJK_TEXT_PATTERN);
      expect(href).toMatch(
        new RegExp(`^/en/products\\?${section}=[a-z0-9-]+$`, "u")
      );
    }
  }

  for (const value of CUSTOM_CAPABILITY_KEYS) {
    expect(buildCatalogHref("custom", value, "/en/products")).toBe(
      `/en/products?custom=${value}`
    );
  }
});

test("resolveCatalogUrlSelection maps ASCII URL identifiers to stored values", () => {
  expect(
    resolveCatalogUrlSelection(
      { color: "off-white" },
      "/en/products"
    )
  ).toEqual({
    section: "color",
    value: "米白",
    invalid: false,
    redirectHref: null,
  });
});

test("resolveCatalogUrlSelection redirects legacy Chinese queries permanently", () => {
  expect(
    resolveCatalogUrlSelection(
      {
        section: "color",
        value: "米白",
        q: "sample slab",
      },
      "/en/products"
    )
  ).toEqual({
    section: "color",
    value: "米白",
    invalid: false,
    redirectHref: "/en/products?color=off-white&q=sample+slab",
  });

  expect(
    resolveCatalogUrlSelection({ color: "米白" }, "/en/products")
  ).toEqual({
    section: "color",
    value: "米白",
    invalid: false,
    redirectHref: "/en/products?color=off-white",
  });
});

test("resolveCatalogUrlSelection rejects unknown and duplicate filters", () => {
  expect(
    resolveCatalogUrlSelection({ color: "not-a-color" }, "/en/products")
      .invalid
  ).toBe(true);
  expect(
    resolveCatalogUrlSelection(
      { color: "off-white", process: "matte" },
      "/en/products"
    ).invalid
  ).toBe(true);
  expect(
    resolveCatalogUrlSelection(
      { color: ["off-white", "white"] },
      "/en/products"
    ).invalid
  ).toBe(true);
  expect(
    resolveCatalogUrlSelection(
      { custom: "not-a-capability" },
      "/en/products"
    ).invalid
  ).toBe(true);
});
