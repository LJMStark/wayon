import { defineField, defineType } from "sanity";

import {
  CUSTOM_CAPABILITIES,
  CUSTOM_CAPABILITY_KEYS,
} from "@/features/products/content/customCapabilities";

export const customCapabilityType = defineType({
  name: "customCapability",
  title: "Custom Capability",
  type: "document",
  fields: [
    defineField({
      name: "capabilityKey",
      title: "Capability Key",
      type: "string",
      options: {
        list: CUSTOM_CAPABILITIES.map((capability) => ({
          title: capability.title,
          value: capability.key,
        })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title (Multi-language)",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (Multi-language)",
      type: "localeString",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  validation: (rule) =>
    rule.custom(async (value, context) => {
      const capabilityKey = value?.capabilityKey;

      if (
        !capabilityKey ||
        CUSTOM_CAPABILITY_KEYS.includes(capabilityKey as (typeof CUSTOM_CAPABILITY_KEYS)[number])
      ) {
        return true;
      }

      return "Unsupported capability key";
    }),
  orderings: [
    {
      title: "Sort Order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title.zh",
      capabilityKey: "capabilityKey",
      media: "coverImage",
    },
    prepare({ title, capabilityKey, media }) {
      const fallbackTitle =
        CUSTOM_CAPABILITIES.find((capability) => capability.key === capabilityKey)
          ?.title ?? capabilityKey;

      return {
        title: title || fallbackTitle,
        subtitle: capabilityKey,
        media,
      };
    },
  },
});
