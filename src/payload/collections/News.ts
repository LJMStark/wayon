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
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) =>
      req.user ? true : { _status: { equals: "published" } },
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
      admin: {
        description: "文章的网址 ID，留空时由标题自动生成。发布后请勿修改，否则旧链接会失效。",
      },
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
        description: "文章在前台显示的日期，用于排序。如需保存草稿，请使用右上角【保存草稿】按钮，无需修改此日期。",
      },
    },
    {
      name: "coverImage",
      label: "封面图",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "新闻列表卡片和文章页顶部使用此图，建议横版 16:9。",
      },
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
