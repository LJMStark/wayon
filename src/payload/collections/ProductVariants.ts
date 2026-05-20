import type { CollectionConfig, Field } from "payload";

import { PRODUCT_CACHE_TAG } from "../../data/cacheTags.ts";
import {
  TRADE_COLOR_GROUPS,
  TRADE_THICKNESSES,
  TRADE_PROCESSES,
  TRADE_SIZES,
} from "../../features/products/lib/tradeCatalog.ts";
import {
  revalidateSiteCacheAfterChange,
  revalidateSiteCacheAfterDelete,
} from "../hooks/revalidateSiteCache.ts";

// The 4 media arrays on ProductVariant keep the exact same field shape as
// the legacy Sanity externalImageMedia / externalVideoMedia object types so
// `src/features/products/lib/tradeMedia.ts` and
// `src/features/products/model/productDirectory.ts` keep working without a
// consumer-side refactor. Any change here must be mirrored there.

const imageMediaFields: Field[] = [
  {
    name: "mediaRef",
    label: "图片文件",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "上传新图片或从媒体库里选一张。只需填这一项即可。",
    },
  },
  {
    name: "sourcePath",
    label: "来源路径",
    type: "text",
    admin: {
      hidden: true,
      description: "系统导入时自动填写，请勿手动修改。",
    },
  },
  {
    name: "publicUrl",
    label: "图片网址",
    type: "text",
    admin: {
      hidden: true,
      description: "系统自动填写。",
    },
  },
  {
    name: "altZh",
    label: "图片说明（中文）",
    type: "text",
    admin: {
      description: "用于无障碍阅读和 SEO，可留空。",
    },
  },
  {
    name: "sortOrder",
    label: "显示顺序",
    type: "number",
    defaultValue: 0,
    admin: {
      description: "数字越小越靠前。默认 0。",
    },
  },
];

const videoMediaFields: Field[] = [
  {
    name: "mediaRef",
    label: "视频文件",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "上传新视频或从媒体库里选一个。只需填这一项即可。",
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
    label: "视频网址",
    type: "text",
    admin: { hidden: true },
  },
  {
    name: "posterUrl",
    label: "视频封面图地址",
    type: "text",
    admin: {
      description: "视频未播放时显示的封面图，可留空。",
    },
  },
  {
    name: "titleZh",
    label: "视频标题（中文）",
    type: "text",
  },
  {
    name: "sortOrder",
    label: "显示顺序",
    type: "number",
    defaultValue: 0,
    admin: {
      description: "数字越小越靠前。默认 0。",
    },
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
    {
      name: "size",
      label: "规格尺寸",
      type: "select",
      required: true,
      options: TRADE_SIZES.map((value) => ({ label: value, value })),
      admin: {
        description: "板材的长×宽（毫米）。官网「规格」筛选从这里读取。",
      },
    },
    {
      name: "thickness",
      label: "板材厚度",
      type: "select",
      options: [
        ...TRADE_THICKNESSES.map((value) => ({ label: value, value })),
        { label: "自定义", value: "custom" },
      ],
      admin: {
        description: "官网「厚度」筛选从这里读取。常见厚度选下拉项；其他厚度选「自定义」并在下方填写。",
      },
    },
    {
      name: "thicknessCustom",
      label: "自定义厚度",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.thickness === "custom",
        description: "如 20mm、30mm 等非标厚度。仅在板材厚度选了「自定义」后出现。",
      },
    },
    {
      name: "process",
      label: "表面工艺",
      type: "select",
      options: TRADE_PROCESSES.map((value) => ({ label: value, value })),
      admin: {
        description: "板材表面处理工艺。官网「表面工艺」筛选从这里读取。",
      },
    },
    {
      name: "colorGroup",
      label: "颜色分类",
      type: "select",
      options: TRADE_COLOR_GROUPS.map((value) => ({ label: value, value })),
      admin: {
        description: "官网「颜色」筛选从这里读取。",
      },
    },
    {
      name: "faceCount",
      label: "纹理面数",
      type: "text",
      admin: {
        description: "例如：单面 / 多面 / 四面。可留空。",
      },
    },
    {
      name: "facePatternNote",
      label: "纹理特点",
      type: "text",
      admin: {
        description: "对纹理的简短描述，可留空。",
      },
    },
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
    {
      name: "elementImages",
      label: "材质纹理图",
      type: "array",
      labels: { singular: "材质纹理图", plural: "材质纹理图" },
      fields: imageMediaFields,
      admin: {
        description:
          "板材表面纹理的特写照片。官网详情页的顶部大背景和「材质纹理」画廊从这里读取，是产品最重要的展示图。",
      },
    },
    {
      name: "spaceImages",
      label: "实景应用图",
      type: "array",
      labels: { singular: "实景应用图", plural: "实景应用图" },
      fields: imageMediaFields,
      admin: {
        description:
          "板材在厨房、卫浴、客厅、背景墙等场景中的应用效果图。官网详情页的「空间应用」画廊从这里读取。",
      },
    },
    {
      name: "realImages",
      label: "工地实拍图",
      type: "array",
      labels: { singular: "工地实拍图", plural: "工地实拍图" },
      fields: imageMediaFields,
      admin: {
        description:
          "工地、施工现场、样板房的真实照片。官网详情页的「实拍图」画廊从这里读取。",
      },
    },
    {
      name: "videos",
      label: "产品视频",
      type: "array",
      labels: { singular: "产品视频", plural: "产品视频" },
      fields: videoMediaFields,
      admin: {
        description: "产品宣传视频或施工演示视频。官网详情页的「视频」模块从这里读取。",
      },
    },
  ],
};
