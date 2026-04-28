import { expect, test } from "vitest";

import robots from "./robots";

function asArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

test("robots allows public trade media and blocks admin plus private APIs", () => {
  const rules = robots().rules;
  const rule = Array.isArray(rules) ? rules[0] : rules;

  expect(asArray(rule.allow)).toEqual(
    expect.arrayContaining(["/", "/api/trade-media/"])
  );
  expect(asArray(rule.disallow)).toEqual(
    expect.arrayContaining(["/admin/", "/api/", "/studio"])
  );
});
