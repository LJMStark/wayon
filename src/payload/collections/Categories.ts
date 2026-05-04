import type { CollectionConfig } from "payload";

import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: "产品分类",
    plural: "产品分类",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "sortOrder"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [slugifyBeforeValidate],
  },
  fields: [
    {
      name: "title",
      label: "标题",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      label: "链接标识",
      type: "text",
      unique: true,
      required: true,
      index: true,
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      localized: true,
    },
    {
      name: "coverImage",
      label: "封面图",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "sortOrder",
      label: "排序",
      type: "number",
      defaultValue: 0,
      index: true,
    },
  ],
};
