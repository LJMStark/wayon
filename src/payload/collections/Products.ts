import type { CollectionConfig } from "payload";

import { TRADE_SERIES_TYPES } from "../../features/products/lib/tradeCatalog.ts";
import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "slug",
      "category",
      "published",
      "featured",
      "sortOrder",
    ],
  },
  access: {
    // Public REST (/api/products) must not leak drafts. Authenticated users
    // (CMS editors) see everything; anonymous callers get a where-filter
    // limiting results to published documents.
    read: ({ req }) =>
      req.user ? true : { published: { equals: true } },
  },
  hooks: {
    beforeValidate: [slugifyBeforeValidate],
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      required: true,
      index: true,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
    },
    {
      name: "normalizedName",
      type: "text",
      admin: {
        description:
          "Deterministic family name used for imported trade materials. Import identity key — do not edit manually.",
      },
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "Controls whether the product is visible on the public site. Imported trade products are auto-published. Manually created products default to unpublished — flip this on once content is ready.",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
    {
      name: "seriesTypes",
      type: "select",
      hasMany: true,
      options: TRADE_SERIES_TYPES.map((value) => ({ label: value, value })),
    },
    {
      name: "catalogMode",
      type: "select",
      defaultValue: "standard",
      options: [
        { label: "Standard Product", value: "standard" },
        { label: "Custom Product", value: "custom" },
      ],
    },
    {
      name: "customCapability",
      type: "relationship",
      relationTo: "customCapabilities",
      admin: {
        condition: (_, siblingData) => siblingData?.catalogMode === "custom",
      },
    },
    {
      name: "coverImageUrl",
      type: "text",
      admin: {
        description:
          "Percent-encoded /api/trade-media/... URL — populated by the trade catalog importer. Plain string, not a Media upload.",
      },
    },
    {
      name: "coverVideoPosterUrl",
      type: "text",
      admin: {
        description:
          "Percent-encoded poster URL for the cover video, if any. Populated by the trade catalog importer.",
      },
    },
    {
      name: "thickness",
      type: "text",
      admin: {
        description: "e.g. 15mm / 20mm / 30mm",
      },
    },
    {
      name: "finish",
      type: "select",
      options: [
        { label: "Polished", value: "polished" },
        { label: "Honed", value: "honed" },
        { label: "Leathered", value: "leathered" },
        { label: "Brushed", value: "brushed" },
        { label: "Sandblasted", value: "sandblasted" },
      ],
    },
    {
      name: "size",
      type: "text",
      admin: {
        description: "e.g. 3200x1600mm",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Show on homepage carousel",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      index: true,
    },
  ],
};
