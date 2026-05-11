import type { CollectionConfig, Field } from "payload";

import {
  TRADE_COLOR_GROUPS,
  TRADE_THICKNESSES,
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
    label: "媒体文件",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "Payload 媒体记录。由 import422Catalog 导入时写入，优先级高于 publicUrl。",
    },
  },
  {
    name: "sourcePath",
    label: "来源路径",
    type: "text",
    admin: {
      hidden: true,
      description: "解码后的相对文件路径，作为旧数据导入识别键。",
    },
  },
  {
    name: "publicUrl",
    label: "公开 URL",
    type: "text",
    admin: {
      hidden: true,
      description: "R2 公开 URL，或旧的 /api/trade-media/... URL。",
    },
  },
  {
    name: "altZh",
    label: "中文替代文本",
    type: "text",
  },
  {
    name: "sortOrder",
    label: "排序",
    type: "number",
    defaultValue: 0,
  },
];

const videoMediaFields: Field[] = [
  {
    name: "mediaRef",
    label: "媒体文件",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "Payload 媒体记录。由 import422Catalog 导入时写入，优先级高于 publicUrl。",
    },
  },
  {
    name: "sourcePath",
    label: "来源路径",
    type: "text",
    admin: { hidden: true },
  },
  {
    name: "publicUrl",
    label: "公开 URL",
    type: "text",
    admin: { hidden: true },
  },
  {
    name: "posterUrl",
    label: "封面图 URL",
    type: "text",
  },
  {
    name: "titleZh",
    label: "中文标题",
    type: "text",
  },
  {
    name: "sortOrder",
    label: "排序",
    type: "number",
    defaultValue: 0,
  },
];

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
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "productRef",
      label: "所属产品",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
    },
    {
      name: "code",
      label: "型号",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "size",
      label: "规格",
      type: "select",
      required: true,
      options: TRADE_SIZES.map((value) => ({ label: value, value })),
    },
    {
      name: "thickness",
      label: "厚度",
      type: "select",
      options: [
        ...TRADE_THICKNESSES.map((value) => ({ label: value, value })),
        { label: "自定义", value: "custom" },
      ],
      admin: {
        description: "前台厚度筛选从这里读取。自定义厂度会归入其他分类。",
      },
    },
    {
      name: "thicknessCustom",
      label: "自定义厂度值",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.thickness === "custom",
        description: "选了自定义后填写，如 20mm、30mm。仅用于展示，不影响筛选分组。",
      },
    },
    {
      name: "process",
      label: "工艺",
      type: "select",
      options: TRADE_PROCESSES.map((value) => ({ label: value, value })),
    },
    {
      name: "colorGroup",
      label: "颜色组",
      type: "select",
      options: TRADE_COLOR_GROUPS.map((value) => ({ label: value, value })),
    },
    {
      name: "faceCount",
      label: "面数",
      type: "text",
      admin: {
        description: "例如：单面 / 多面 / 四面",
      },
    },
    {
      name: "facePatternNote",
      label: "纹理说明",
      type: "text",
    },
    {
      name: "sortOrder",
      label: "排序",
      type: "number",
      defaultValue: 0,
      index: true,
    },
    {
      name: "elementImages",
      label: "元素图",
      type: "array",
      labels: { singular: "元素图", plural: "元素图" },
      fields: imageMediaFields,
    },
    {
      name: "spaceImages",
      label: "空间图",
      type: "array",
      labels: { singular: "空间图", plural: "空间图" },
      fields: imageMediaFields,
    },
    {
      name: "realImages",
      label: "实拍图",
      type: "array",
      labels: { singular: "实拍图", plural: "实拍图" },
      fields: imageMediaFields,
    },
    {
      name: "videos",
      label: "视频",
      type: "array",
      labels: { singular: "视频", plural: "视频" },
      fields: videoMediaFields,
    },
  ],
};
