import { expect, test } from "vitest";

import { resolveProductsCatalogRequest } from "@/features/products/model/productsSearchParams";

test("proxy permanently redirects legacy Chinese product filters", () => {
  const response = resolveProductsCatalogRequest(
    "GET",
    "https://example.com/en/products?section=color&value=%E7%B1%B3%E7%99%BD"
  );

  expect(response).toEqual({
    type: "redirect",
    location: "https://example.com/en/products?color=off-white",
  });
});

test("proxy permanently redirects legacy category aliases", () => {
  const response = resolveProductsCatalogRequest(
    "GET",
    "https://example.com/en/products?category=quartz"
  );

  expect(response).toEqual({
    type: "redirect",
    location: "https://example.com/en/products?series=texture-slab",
  });
});

test("proxy returns 404 for invalid or duplicate catalog filters", () => {
  for (const query of [
    "color=unknown",
    "custom=unknown",
    "category=",
    "color=white&category=",
    "category=quartz&section=",
    "color=__proto__",
    "series=toString",
    "color=white&process=matte",
    "color=white&color=black",
  ]) {
    const response = resolveProductsCatalogRequest(
      "GET",
      `https://example.com/en/products?${query}`
    );

    expect(response).toEqual({ type: "notFound" });
  }
});

test("proxy leaves canonical and unrelated requests alone", () => {
  expect(
    resolveProductsCatalogRequest(
      "GET",
      "https://example.com/en/products?color=off-white"
    )
  ).toEqual({ type: "pass" });
  expect(
    resolveProductsCatalogRequest(
      "GET",
      "https://example.com/en/news?color=unknown"
    )
  ).toEqual({ type: "pass" });
  expect(
    resolveProductsCatalogRequest(
      "POST",
      "https://example.com/en/products?color=unknown"
    )
  ).toEqual({ type: "pass" });
});
