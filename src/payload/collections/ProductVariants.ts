import type { CollectionConfig } from "payload";

import { PRODUCT_CACHE_TAG } from "../../data/cacheTags.ts";
import {
  variantAttributeFields,
  variantMediaFields,
} from "../lib/variantFields.ts";
import {
  revalidateSiteCacheAfterChange,
  revalidateSiteCacheAfterDelete,
} from "../hooks/revalidateSiteCache.ts";

// ProductVariants is the legacy 1:1 sibling table to Products. During the
// expand-contract migration window (Deploy 1 → Deploy 2), this collection
// continues to exist with the same schema, fed by importers and the dual-write
// fallback path in src/data/products.ts. Deploy 2 will delete this collection
// after the production data has been merged into Products itself.
//
// Shared field shapes (variantAttributeFields, variantMediaFields,
// imageMediaFields, videoMediaFields) live in ../lib/variantFields.ts so that
// the parallel new fields on Products and these legacy fields here stay byte-
// for-byte identical and cannot drift mid-migration.

export const ProductVariants: CollectionConfig = {
  slug: "productVariants",
  labels: {
    singular: "产品规格",
    plural: "产品规格",
  },
  admin: {
    group: "产品管理",
    useAsTitle: "code",
    defaultColumns: ["code", "productRef", "size", "process", "sortOrder"],
    description:
      "产品的规格信息（尺寸、厚度、表面工艺、颜色、产品图片、视频）。每个产品对应一条规格。产品名称、产品介绍、封面图等通用信息在「产品」集合编辑。",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateSiteCacheAfterChange([PRODUCT_CACHE_TAG])],
    afterDelete: [revalidateSiteCacheAfterDelete([PRODUCT_CACHE_TAG])],
  },
  fields: [
    {
      name: "productRef",
      label: "对应产品",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
      admin: {
        description: "这条规格属于哪个产品。",
      },
    },
    {
      name: "code",
      label: "产品编号",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "对应产品的唯一编号，例如 LV930R45。",
      },
    },
    // 7 attribute fields with size flagged required (matches the legacy
    // NOT NULL constraint on product_variants.size). The Products collection
    // imports the same array but leaves size nullable during Deploy 1.
    ...variantAttributeFields.map((field) =>
      field.type === "select" && (field as { name?: string }).name === "size"
        ? { ...field, required: true }
        : field,
    ),
    {
      name: "sortOrder",
      label: "列表顺序",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: {
        description: "数字越小越靠前。默认 0。",
      },
    },
    ...variantMediaFields,
  ],
};
