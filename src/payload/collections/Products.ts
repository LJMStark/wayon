import type { CollectionConfig } from "payload";

import { TRADE_SERIES_TYPES } from "../../features/products/lib/tradeCatalog.ts";
import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "产品",
    plural: "产品",
  },
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
      name: "category",
      label: "产品分类",
      type: "relationship",
      relationTo: "categories",
    },
    {
      name: "normalizedName",
      label: "标准化名称",
      type: "text",
      admin: {
        description:
          "导入产品时生成的族系名称，用作导入识别键。不要手动修改。",
      },
    },
    {
      name: "published",
      label: "发布到前台",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "控制产品是否在官网显示。导入产品会自动发布，手动新建产品默认不发布，内容准备好后再打开。",
      },
    },
    {
      name: "image",
      label: "主图",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      localized: true,
    },
    {
      name: "seriesTypes",
      label: "系列类型",
      type: "select",
      hasMany: true,
      options: TRADE_SERIES_TYPES.map((value) => ({ label: value, value })),
    },
    {
      name: "catalogMode",
      label: "产品类型",
      type: "select",
      defaultValue: "standard",
      options: [
        { label: "标准产品", value: "standard" },
        { label: "定制产品", value: "custom" },
      ],
    },
    {
      name: "customCapability",
      label: "关联定制能力",
      type: "relationship",
      relationTo: "customCapabilities",
      admin: {
        condition: (_, siblingData) => siblingData?.catalogMode === "custom",
      },
    },
    {
      name: "coverImageUrl",
      label: "封面图 URL",
      type: "text",
      admin: {
        description:
          "导入脚本写入的 /api/trade-media/... URL。这里是字符串，不是媒体上传。",
      },
    },
    {
      name: "coverVideoPosterUrl",
      label: "封面视频海报 URL",
      type: "text",
      admin: {
        description: "导入脚本写入的封面视频海报 URL。",
      },
    },
    {
      name: "thickness",
      label: "厚度",
      type: "text",
      admin: {
        description: "e.g. 15mm / 20mm / 30mm",
      },
    },
    {
      name: "finish",
      label: "表面工艺",
      type: "select",
      options: [
        { label: "亮光", value: "polished" },
        { label: "哑光", value: "honed" },
        { label: "皮纹", value: "leathered" },
        { label: "拉丝", value: "brushed" },
        { label: "喷砂", value: "sandblasted" },
      ],
    },
    {
      name: "size",
      label: "规格",
      type: "text",
      admin: {
        description: "e.g. 3200x1600mm",
      },
    },
    {
      name: "featured",
      label: "首页推荐",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "显示在首页轮播中",
      },
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
