import { expect, test } from "vitest";

import { getMetadataCopy } from "./siteCopy";

test("Chinese home metadata leads with the exact brand search term", () => {
  const metadata = getMetadataCopy("zh").root;

  expect(metadata.title).toMatch(/^众岩联岩板官网/);
  expect(metadata.description).toContain("众岩联岩板官网");
});
