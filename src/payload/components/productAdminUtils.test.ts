import { expect, test } from "vitest";

import { pickVariantCoverUrl, readUrlFromMediaRef } from "./productAdminUtils.ts";

test("readUrlFromMediaRef rejects retired Payload media-file URLs", () => {
  expect(readUrlFromMediaRef("/api/media/file/broken.jpg")).toBe(null);
  expect(
    readUrlFromMediaRef("https://zylsinteredstone.com/api/media/file/broken.jpg")
  ).toBe(null);
  expect(readUrlFromMediaRef("https://media.example.com/image.jpg")).toBe(
    "https://media.example.com/image.jpg"
  );
});

test("pickVariantCoverUrl skips retired public URLs in admin previews", () => {
  expect(
    pickVariantCoverUrl([
      {
        code: "A",
        sortOrder: 0,
        elementImages: [
          {
            publicUrl: "/api/media/file/old-element.jpg",
            mediaRef: { url: "https://media.example.com/element.jpg" },
          },
        ],
        spaceImages: [],
        realImages: [],
        videos: [],
      },
    ])
  ).toBe("https://media.example.com/element.jpg");

  expect(
    pickVariantCoverUrl([
      {
        code: "B",
        sortOrder: 0,
        elementImages: [
          {
            publicUrl:
              "https://zylsinteredstone.com/api/media/file/old-element.jpg",
          },
        ],
        spaceImages: [{ publicUrl: "https://media.example.com/space.jpg" }],
        realImages: [],
        videos: [],
      },
    ])
  ).toBe("https://media.example.com/space.jpg");
});
