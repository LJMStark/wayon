import type { CollectionConfig } from "payload";

import {
  CUSTOM_CAPABILITIES,
  CUSTOM_CAPABILITY_KEYS,
} from "../../features/products/content/customCapabilities.ts";

export const CustomCapabilities: CollectionConfig = {
  slug: "customCapabilities",
  admin: {
    useAsTitle: "capabilityKey",
    defaultColumns: ["capabilityKey", "sortOrder"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "capabilityKey",
      type: "select",
      required: true,
      unique: true,
      index: true,
      options: CUSTOM_CAPABILITIES.map((capability) => ({
        label: capability.title,
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
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "description",
      type: "text",
      localized: true,
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      index: true,
    },
  ],
};
