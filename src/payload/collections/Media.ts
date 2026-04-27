import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*", "video/mp4", "video/quicktime"],
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
    {
      name: "category",
      type: "select",
      options: [
        { label: "Product", value: "product" },
        { label: "License / Qualification", value: "license" },
        { label: "Showroom", value: "showroom" },
        { label: "Factory", value: "factory" },
        { label: "Case (Sales)", value: "case-sales" },
        { label: "Case (Factory)", value: "case-factory" },
        { label: "Other", value: "other" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Asset class. Existing product images are backfilled to 'product' by migration; non-product uploads should pick the matching tag.",
      },
    },
  ],
};
