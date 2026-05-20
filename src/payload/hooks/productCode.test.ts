import { expect, test } from "vitest";

import { setProductCodeFromSlug } from "./productCode";

type HookArgs = Parameters<typeof setProductCodeFromSlug>[0];

function runHook(
  data: Record<string, unknown>,
  operation: HookArgs["operation"]
) {
  setProductCodeFromSlug({ data, operation } as HookArgs);
  return data;
}

test("sets productCode to slug.toUpperCase() on create", () => {
  const data = runHook({ slug: "lv826y053jd" }, "create");
  expect(data.productCode).toBe("LV826Y053JD");
});

test("refreshes productCode when slug is changed on update", () => {
  const data = runHook(
    { slug: "lv930r45", productCode: "OLD-CODE" },
    "update"
  );
  expect(data.productCode).toBe("LV930R45");
});

test("leaves productCode untouched on locale-only update (slug omitted)", () => {
  const data = runHook({ title: { en: "Royal" } }, "update");
  expect(data).not.toHaveProperty("productCode");
});

test("does not set productCode when slug is empty", () => {
  const data = runHook({ slug: "" }, "update");
  expect(data).not.toHaveProperty("productCode");
});
