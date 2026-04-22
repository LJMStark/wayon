import type { CollectionConfig } from "payload";

import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const News: CollectionConfig = {
  slug: "news",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "category"],
  },
  access: {
    // Public REST (/api/news) must not leak future-dated posts. Authenticated
    // users (CMS editors) see everything; anonymous callers are restricted to
    // news whose publishedAt is in the past.
    read: ({ req }) =>
      req.user
        ? true
        : { publishedAt: { less_than_equal: new Date().toISOString() } },
  },
  hooks: {
    beforeValidate: [slugifyBeforeValidate],
  },
  defaultSort: "-publishedAt",
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
      name: "publishedAt",
      type: "date",
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "excerpt",
      type: "textarea",
      localized: true,
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Company News", value: "company" },
        { label: "Industry News", value: "industry" },
        { label: "Exhibition", value: "exhibition" },
        { label: "Product Launch", value: "product" },
      ],
    },
    {
      name: "body",
      type: "richText",
      localized: true,
    },
  ],
};
