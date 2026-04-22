import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name"],
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
