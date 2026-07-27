import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import FloatingSidebar from "./FloatingSidebar";

test("floating social links remain visible on mobile", () => {
  const $ = load(renderToStaticMarkup(<FloatingSidebar />));
  const sidebar = $('nav[aria-label="Social media links"]');
  const classNames = sidebar.attr("class")?.split(/\s+/) ?? [];

  expect(sidebar).toHaveLength(1);
  expect(classNames).toContain("flex");
  expect(classNames).not.toContain("hidden");
});
