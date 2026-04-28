import { expect, test, vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
  routing: {
    defaultLocale: "zh",
    locales: ["en", "zh", "es", "ar"],
  },
}));

vi.mock("@/lib/metadata", () => ({
  buildPageMetadata: vi.fn((metadata) => metadata),
}));

test("cases metadata uses dedicated cases copy", async () => {
  const { generateMetadata } = await import("./layout");
  const metadata = await generateMetadata({
    params: Promise.resolve({ locale: "en" }),
    children: null,
  });

  expect(metadata.title).toBe("Project Cases | Sales & Factory Cooperation");
  expect(metadata.description).toBe(
    "Explore ZYL cooperation cases for distributors, fabricators and factory partners across global stone projects."
  );
  expect(metadata.title).not.toBe("Stone Solutions | Countertops, Walls & Flooring");
});
