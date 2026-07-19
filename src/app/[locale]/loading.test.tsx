import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";

vi.mock("next-intl", () => ({
  useLocale: () => "zh",
}));

import LocaleLoading from "./loading";

test("locale loading fallback reserves a full small viewport", () => {
  const markup = renderToStaticMarkup(<LocaleLoading />);

  expect(markup).toContain('role="status"');
  expect(markup).toContain("min-h-[100svh]");
});
