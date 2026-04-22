import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*", "video/mp4"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 768 },
      { name: "feature", width: 1600 },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
    },
    {
      name: "caption",
      type: "text",
      localized: true,
    },
  ],
};
