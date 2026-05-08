import type { CollectionConfig } from "payload";

import { translationMetaField } from "../fields/translationMeta.ts";
import { clearAutoTranslatedFlagsBeforeChange } from "../hooks/translationMeta.ts";
import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const News: CollectionConfig = {
  slug: "news",
  labels: {
    singular: "新闻",
    plural: "新闻",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "category"],
    components: {
      beforeListTable: [
        "@/payload/components/NewsBatchTranslateButton#NewsBatchTranslateButton",
      ],
    },
  },
  access: {
    // Public REST (/api/news) must not leak future-dated posts. Authenticated
    // users (CMS editors) see everything; anonymous callers are restricted to
    // news whose publishedAt is in the past.
    read: ({ req }) =>
      req.user
        ? true
        : { publishedAt: { less_than_equal: new Date().toISOString() } },
  },
  hooks: {
    beforeValidate: [slugifyBeforeValidate],
    beforeChange: [
      clearAutoTranslatedFlagsBeforeChange({
        localizedFields: ["title", "excerpt", "body"],
      }),
    ],
  },
  defaultSort: "-publishedAt",
  fields: [
    {
      name: "translationActions",
      type: "ui",
      admin: {
        components: {
          Field:
            "@/payload/components/TranslationActionsField#TranslationActionsField",
        },
      },
    },
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
      name: "publishedAt",
      label: "发布时间",
      type: "date",
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "coverImage",
      label: "封面图",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "excerpt",
      label: "摘要",
      type: "textarea",
      localized: true,
    },
    {
      name: "category",
      label: "新闻分类",
      type: "select",
      options: [
        { label: "公司新闻", value: "company" },
        { label: "行业新闻", value: "industry" },
        { label: "展会活动", value: "exhibition" },
        { label: "新品发布", value: "product" },
      ],
    },
    {
      name: "body",
      label: "正文",
      type: "richText",
      localized: true,
    },
    translationMetaField,
  ],
};
