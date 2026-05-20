import type { Field } from "payload";

import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SIZES,
  TRADE_THICKNESSES,
} from "../../features/products/lib/tradeCatalog.ts";

// Variant field definitions (size, thickness, process, color, and the 4 media
// arrays) for the Products collection. These attributes were merged onto
// Products from the former ProductVariants table (2026-05-20); ProductVariants
// no longer exists, so Products is the only consumer of this module.

export const imageMediaFields: Field[] = [
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

export const videoMediaFields: Field[] = [
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

// 7 plain attribute fields, defined directly on the Products collection.
export const variantAttributeFields: Field[] = [
  {
    name: "size",
    label: "规格尺寸",
    type: "select",
    // Optional on Products: not every product row carries a full variant
    // spec (size etc.), and the variants → products backfill left some rows
    // without one.
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
      description:
        "官网「厚度」筛选从这里读取。常见厚度选下拉项；其他厚度选「自定义」并在下方填写。",
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
];

// 4 media array fields on the Products collection.
export const variantMediaFields: Field[] = [
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
];
