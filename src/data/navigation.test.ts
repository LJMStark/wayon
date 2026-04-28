import { expect, test } from "vitest";

import { TRADE_PROCESSES } from "@/features/products/lib/tradeCatalog";

import { NAV_ITEMS } from "./navigation";

test("collection process menu exposes every supported process", () => {
  const collection = NAV_ITEMS.find((item) => item.label === "collection");
  const processSection = collection?.subItems?.find(
    (item) => item.label === "catalogProcess"
  );

  const values =
    processSection?.children?.map((child) => {
      const url = new URL(child.href, "https://example.com");
      return url.searchParams.get("value");
    }) ?? [];

  expect(values).toEqual([...TRADE_PROCESSES]);
});
