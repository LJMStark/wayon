import { expect, test } from "vitest";

import { resolveGlobalErrorLocale } from "./global-error-locale";

test("global error locale does not default to Chinese", () => {
  expect(resolveGlobalErrorLocale("")).toBe("en");
  expect(resolveGlobalErrorLocale("foo=bar")).toBe("en");
  expect(resolveGlobalErrorLocale("NEXT_LOCALE=zh")).toBe("zh");
  expect(resolveGlobalErrorLocale("NEXT_LOCALE=es")).toBe("es");
});
