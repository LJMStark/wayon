import { expect, test } from "vitest";

import nextConfig from "../next.config";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

test("legacy redirects are permanent for SEO migration", async () => {
  const redirects = await (
    nextConfig as { redirects: () => Promise<Redirect[]> }
  ).redirects();

  expect(redirects.length).toBeGreaterThan(0);
  expect(redirects).toContainEqual(
    expect.objectContaining({
      source: "/products/quartz.html",
      permanent: true,
    })
  );
  expect(redirects.every((redirect) => redirect.permanent)).toBe(true);
});
