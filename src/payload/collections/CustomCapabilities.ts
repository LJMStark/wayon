import type { CollectionConfig } from "payload";

import {
  CUSTOM_CAPABILITIES,
  CUSTOM_CAPABILITY_KEYS,
} from "../../features/products/content/customCapabilities.ts";

export const CustomCapabilities: CollectionConfig = {
  slug: "customCapabilities",
  labels: {
    singular: "定制能力",
    plural: "定制能力",
  },
  admin: {
    group: "产品管理",
    useAsTitle: "capabilityKey",
    defaultColumns: ["capabilityKey", "sortOrder"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "capabilityKey",
      label: "能力类型",
      type: "select",
      required: true,
      unique: true,
      index: true,
      options: CUSTOM_CAPABILITIES.map((capability) => ({
        label: capability.title.zh,
        value: capability.key,
      })),
      validate: (value: unknown) => {
        if (typeof value !== "string" || value.length === 0) {
          return "capabilityKey is required";
        }
        if (!CUSTOM_CAPABILITY_KEYS.includes(value as (typeof CUSTOM_CAPABILITY_KEYS)[number])) {
          return "Unsupported capability key";
        }
        return true;
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
      name: "description",
      label: "描述",
      type: "text",
      localized: true,
    },
    {
      name: "coverImage",
      label: "封面图",
      type: "upload",
      relationTo: "media",
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
