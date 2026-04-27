import type { CollectionConfig, Field } from "payload";

import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SIZES,
} from "../../features/products/lib/tradeCatalog.ts";

// The 4 media arrays on ProductVariant keep the exact same field shape as
// the legacy Sanity externalImageMedia / externalVideoMedia object types so
// `src/features/products/lib/tradeMedia.ts` and
// `src/features/products/model/productDirectory.ts` keep working without a
// consumer-side refactor. Any change here must be mirrored there.

const imageMediaFields: Field[] = [
  {
    name: "mediaRef",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "Payload Media record — set when importing via import422Catalog. Takes precedence over publicUrl.",
    },
  },
  {
    name: "sourcePath",
    type: "text",
    admin: {
      description: "Decoded filesystem-relative path (legacy import identity key)",
    },
  },
  {
    name: "publicUrl",
    type: "text",
    admin: {
      description: "R2 public URL (preferred) or legacy /api/trade-media/... URL",
    },
  },
  {
    name: "altZh",
    type: "text",
  },
  {
    name: "sortOrder",
    type: "number",
    defaultValue: 0,
  },
];

const videoMediaFields: Field[] = [
  {
    name: "mediaRef",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "Payload Media record — set when importing via import422Catalog. Takes precedence over publicUrl.",
    },
  },
  {
    name: "sourcePath",
    type: "text",
  },
  {
    name: "publicUrl",
    type: "text",
  },
  {
    name: "posterUrl",
    type: "text",
  },
  {
    name: "titleZh",
    type: "text",
  },
  {
    name: "sortOrder",
    type: "number",
    defaultValue: 0,
  },
];

export const ProductVariants: CollectionConfig = {
  slug: "productVariants",
  admin: {
    useAsTitle: "code",
    defaultColumns: ["code", "productRef", "size", "process", "sortOrder"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "productRef",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
    },
    {
      name: "code",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "size",
      type: "select",
      required: true,
      options: TRADE_SIZES.map((value) => ({ label: value, value })),
    },
    {
      name: "thickness",
      type: "text",
    },
    {
      name: "process",
      type: "select",
      options: TRADE_PROCESSES.map((value) => ({ label: value, value })),
    },
    {
      name: "colorGroup",
      type: "select",
      options: TRADE_COLOR_GROUPS.map((value) => ({ label: value, value })),
    },
    {
      name: "faceCount",
      type: "text",
      admin: {
        description: "For example: 单面 / 多面 / 四面",
      },
    },
    {
      name: "facePatternNote",
      type: "text",
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      index: true,
    },
    {
      name: "elementImages",
      type: "array",
      fields: imageMediaFields,
    },
    {
      name: "spaceImages",
      type: "array",
      fields: imageMediaFields,
    },
    {
      name: "realImages",
      type: "array",
      fields: imageMediaFields,
    },
    {
      name: "videos",
      type: "array",
      fields: videoMediaFields,
    },
  ],
};
