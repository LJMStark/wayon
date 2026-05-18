import { expect, test } from "vitest";

import { slugifyBeforeValidate } from "./slug";

type HookArgs = Parameters<typeof slugifyBeforeValidate>[0];

async function runSlugHook(data: Record<string, unknown>, operation: HookArgs["operation"]) {
  await slugifyBeforeValidate({ data, operation } as HookArgs);
  return data;
}

test("slugifyBeforeValidate generates a slug on create when the slug field is omitted", async () => {
  const data = await runSlugHook({ title: "皇家鱼肚白" }, "create");

  expect(data.slug).toBe("huang-jia-yu-du-bai");
});

test("slugifyBeforeValidate leaves stored slug untouched on locale-only update", async () => {
  const data = await runSlugHook({ title: "Royal Jade White" }, "update");

  expect(data).not.toHaveProperty("slug");
});

test("slugifyBeforeValidate regenerates when an empty slug is submitted explicitly", async () => {
  const data = await runSlugHook({ title: "皇家鱼肚白", slug: "" }, "update");

  expect(data.slug).toBe("huang-jia-yu-du-bai");
});
