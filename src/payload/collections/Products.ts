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
      "title",
      "slug",
      "seriesTypes",
      "catalogMode",
      "published",
      "sortOrder",
    ],
    description:
      "前台产品目录主要读取“系列类型”“产品类型”和“产品规格”。旧的“产品分类”仅保留给历史数据，不再作为前台筛选依据。",
    components: {
      beforeListTable: [
        "@/payload/components/ProductsBatchTranslateButton#ProductsBatchTranslateButton",
      ],
    },
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
      name: "category",
      label: "产品分类",
      type: "relationship",
      relationTo: "categories",
      admin: {
        hidden: true,
      },
    },
    {
      name: "normalizedName",
      label: "标准化名称",
      type: "text",
      admin: {
        hidden: true,
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
      admin: {
        description: "产品列表卡片和详情页首屏优先使用这张图。",
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
          "前台左侧“定制产品”从这里读取。常规现货产品保持“标准产品”。",
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
          "仅“定制产品”显示。前台“定制产品”栏目里的二级能力项从这里读取。",
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
      name: "thickness",
      label: "厚度",
      type: "text",
      admin: {
        hidden: true,
        description:
          "旧字段。前台厚度筛选从“产品规格”集合读取，不再从产品主表读取。",
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
      admin: {
        hidden: true,
        description:
          "旧字段。前台表面工艺筛选从“产品规格”集合读取，不再从产品主表读取。",
      },
    },
    {
      name: "size",
      label: "规格",
      type: "text",
      admin: {
        hidden: true,
        description:
          "旧字段。前台规格筛选从“产品规格”集合读取，不再从产品主表读取。",
      },
    },
    {
      name: "featured",
      label: "首页推荐",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "显示在首页轮播中。前台数据层通过 featured=true 查询此字段，勿删。",
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
        description: "该产品下的所有型号，可直接在此处新增或编辑，无需跳转到【产品型号】集合。",
        defaultColumns: ["code", "size", "thickness", "process", "colorGroup", "sortOrder"],
      },
    },
    translationMetaField,
  ],
};
