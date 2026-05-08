import { expect, test } from "vitest";

import { getLocaleFromPathname, getServerLocale } from "./error-locale";

test("locale error boundary does not use Chinese as fallback", () => {
  expect(getLocaleFromPathname("/en/products")).toBe("en");
  expect(getLocaleFromPathname("/es/products")).toBe("es");
  expect(getLocaleFromPathname("/ar/products")).toBe("ar");
  expect(getLocaleFromPathname("/products")).toBe("en");
  expect(getServerLocale()).toBe("en");
});
