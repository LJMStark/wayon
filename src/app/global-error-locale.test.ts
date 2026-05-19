import { expect, test } from "vitest";

import { resolveGlobalErrorLocale } from "./global-error-locale";

test("global error locale does not default to Chinese", () => {
  expect(resolveGlobalErrorLocale("")).toBe("en");
  expect(resolveGlobalErrorLocale("foo=bar")).toBe("en");
  expect(resolveGlobalErrorLocale("NEXT_LOCALE=zh")).toBe("zh");
  expect(resolveGlobalErrorLocale("NEXT_LOCALE=es")).toBe("es");
});

test("global error locale prefers the locale segment from the URL path", () => {
  expect(resolveGlobalErrorLocale("", "/zh/products")).toBe("zh");
  expect(resolveGlobalErrorLocale("", "/ar/news/example")).toBe("ar");
  expect(resolveGlobalErrorLocale("NEXT_LOCALE=en", "/es")).toBe("es");
});
