import type { CollectionConfig } from "payload";

import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "sortOrder"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [slugifyBeforeValidate],
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      required: true,
      index: true,
    },
    {
      name: "description",
      type: "textarea",
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
