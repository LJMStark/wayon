import type { CollectionConfig } from "payload";

import { TRADE_SERIES_TYPES } from "../../features/products/lib/tradeCatalog.ts";
import { translationMetaField } from "../fields/translationMeta.ts";
import { clearAutoTranslatedFlagsBeforeChange } from "../hooks/translationMeta.ts";
import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "产品",
    plural: "产品",
  },
  admin: {
    group: "产品管理",
    useAsTitle: "title",
    defaultColumns: [
      "image",
      "title",
      "slug",
      "seriesTypes",
      "catalogMode",
      "published",
      "variants",
      "sortOrder",
    ],
    description:
      "前台产品目录主要读取“系列类型”“产品类型”和“产品规格（型号）”。新增产品时建议顺序：填标题 → 选系列类型 → 上传主图 → 在下方“产品型号”里添加规格 → 打开“发布到前台”。",
    components: {
      beforeListTable: [
        "@/payload/components/ProductListToolbar#ProductListToolbar",
        "@/payload/components/ProductsBatchTranslateButton#ProductsBatchTranslateButton",
      ],
    },
  },
  access: {
    // Public REST (/api/products) must not leak drafts. Authenticated users
    // (CMS editors) see everything; anonymous callers get a where-filter
    // limiting results to published documents.
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
  },
  hooks: {
    beforeValidate: [slugifyBeforeValidate],
    beforeChange: [
      clearAutoTranslatedFlagsBeforeChange({
        localizedFields: ["title", "description"],
      }),
    ],
  },
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
      name: "normalizedName",
      label: "标准化名称",
      type: "text",
      admin: {
        hidden: true,
        description: "导入产品时生成的族系名称，用作导入识别键。不要手动修改。",
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
      admin: {
        description:
          "产品列表卡片和详情页首屏优先使用这张图。如果留空，前台会自动从该产品的第一个型号里取图（优先级：元素图 → 空间图 → 实拍图），列表页的“封面”列也会显示该兜底图。",
        components: {
          Cell: "@/payload/components/ProductCoverCell#ProductCoverCell",
        },
      },
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
      admin: {
        description:
          "前台左侧“岩板产品系列 / 特惠系列”从这里读取。需要进入“特惠系列”的产品，请在这里勾选“特惠系列”。",
      },
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
      admin: {
        description:
          "「标准产品」= 常规现货，进入官网“岩板产品系列”分类。「定制产品」= 客户按需定制的产品，选择后下方会出现“关联定制能力”字段。大部分情况保持「标准产品」。",
      },
    },
    {
      name: "customCapability",
      label: "关联定制能力",
      type: "relationship",
      relationTo: "customCapabilities",
      admin: {
        condition: (_, siblingData) => siblingData?.catalogMode === "custom",
        description:
          "仅在“产品类型”选了「定制产品」时显示。选一项定制能力（如“定制颜色”“定制图案设计”），前台“定制产品”栏目会把本产品归入对应能力分组下。",
      },
    },
    {
      name: "coverImageUrl",
      label: "封面图 URL",
      type: "text",
      admin: {
        hidden: true,
        description:
          "导入脚本写入的 /api/trade-media/... URL。这里是字符串，不是媒体上传。",
      },
    },
    {
      name: "coverVideoPosterUrl",
      label: "封面视频海报 URL",
      type: "text",
      admin: {
        hidden: true,
        description: "导入脚本写入的封面视频海报 URL。",
      },
    },
    {
      name: "sortOrder",
      label: "排序",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "variants",
      label: "产品型号",
      type: "join",
      collection: "productVariants",
      on: "productRef",
      admin: {
        description:
          "该产品下的所有型号，可直接在此处新增或编辑，无需跳转到【产品型号】集合。",
        defaultColumns: [
          "code",
          "size",
          "thickness",
          "process",
          "colorGroup",
          "sortOrder",
        ],
      },
    },
    translationMetaField,
  ],
};
