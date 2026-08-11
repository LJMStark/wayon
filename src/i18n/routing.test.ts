import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/navigation", () => ({
  createNavigation: () => ({}),
}));

import { routing } from "./routing";

describe("localized routing", () => {
  it("uses English as the fallback locale", () => {
    expect(routing.defaultLocale).toBe("en");
  });

  it("keeps every locale prefixed and leaves hreflang generation to metadata", () => {
    expect(routing.localePrefix).toBe("always");
    expect(routing.alternateLinks).toBe(false);
  });
});
