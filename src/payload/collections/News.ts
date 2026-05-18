import type { CollectionConfig } from "payload";

import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const News: CollectionConfig = {
  slug: "news",
  labels: {
    singular: "新闻",
    plural: "新闻",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "category", "localeStatus"],
    description:
      "多语言新闻：标题、摘要、正文需要按 4 个语种分别填写。请使用页面右上角的语言切换器逐个语言录入内容；切换语言后保存只会保存当前语言的内容。某语种留空时，前台会自动回落显示英文；若英文也为空，该语种页面不会展示这条新闻。",
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
  },
  defaultSort: "-publishedAt",
  fields: [
    {
      name: "localeCompletenessWarning",
      type: "ui",
      admin: {
        components: {
          Field:
            "@/payload/components/LocaleCompletenessWarning#LocaleCompletenessWarning",
        },
      },
    },
    {
      name: "frontendLinks",
      type: "ui",
      admin: {
        components: {
          Field:
            "@/payload/components/NewsFrontendLinksField#NewsFrontendLinksField",
        },
      },
    },
    {
      name: "title",
      label: "标题",
      type: "text",
      localized: true,
      required: true,
      admin: {
        description: "多语言字段，请在每个语言下分别填写真实的目标语言翻译（不要把中文复制到英文/西语/阿语字段，前台会判定为未翻译并自动回落英文）。",
      },
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
      admin: {
        description: "多语言字段，请在每个语言下分别填写真实的目标语言翻译（不要把中文复制到英文/西语/阿语字段）。某语种留空或仅含中文时回落显示英文摘要；英文也为空时前台不显示摘要。",
      },
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
      admin: {
        description: "多语言字段，请在每个语言下分别填写真实的目标语言翻译（不要把中文复制到英文/西语/阿语字段，前台会判定为未翻译）。",
      },
    },
    {
      name: "localeStatus",
      label: "语言",
      type: "ui",
      admin: {
        components: {
          Cell: "@/payload/components/LocaleStatusCell#NewsLocaleStatusCell",
        },
      },
    },
  ],
};
