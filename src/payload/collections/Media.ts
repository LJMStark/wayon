import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "媒体素材",
    plural: "媒体素材",
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*", "video/mp4", "video/quicktime"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 768 },
      { name: "feature", width: 1600 },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      label: "替代文本",
      type: "text",
      localized: true,
    },
    {
      name: "caption",
      label: "说明文字",
      type: "text",
      localized: true,
    },
    {
      name: "category",
      label: "素材分类",
      type: "select",
      options: [
        { label: "产品", value: "product" },
        { label: "资质 / 证书", value: "license" },
        { label: "展厅", value: "showroom" },
        { label: "工厂", value: "factory" },
        { label: "案例（销售）", value: "case-sales" },
        { label: "案例（工厂）", value: "case-factory" },
        { label: "其他", value: "other" },
      ],
      admin: {
        position: "sidebar",
        description:
          "素材用途分类。产品图已由迁移脚本标记为“产品”，其他上传素材请选择对应分类。",
      },
    },
  ],
};
