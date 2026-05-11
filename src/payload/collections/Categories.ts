import type { CollectionConfig } from "payload";

import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: "产品分类",
    plural: "产品分类",
  },
  admin: {
    group: "产品管理",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "sortOrder"],
    description:
      "用于在产品详情页大标题下方显示一个自定义副标题（例如“莱茵金府”）。可选功能：如果不打算用，留空即可，产品也不必关联任何分类。",
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
