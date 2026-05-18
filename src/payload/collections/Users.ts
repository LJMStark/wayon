import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "管理员",
    plural: "管理员",
  },
  auth: true,
  access: {
    delete: () => false,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name"],
  },
  fields: [
    {
      name: "name",
      label: "姓名",
      type: "text",
    },
  ],
};
