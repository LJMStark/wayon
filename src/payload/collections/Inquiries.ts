import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

const lowercaseEmail: CollectionBeforeChangeHook = async ({ data }) => {
  if (data && typeof data.email === "string") {
    data.email = data.email.toLowerCase();
  }
  return data;
};

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  labels: {
    singular: "询盘",
    plural: "询盘",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "company", "status", "createdAt"],
  },
  access: {
    // Block public REST writes. Inquiry submissions go through the
    // validated server action (src/app/actions/inquiry.ts), which uses
    // Payload's Local API and bypasses this predicate.
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [lowercaseEmail],
  },
  defaultSort: "-createdAt",
  timestamps: true,
  fields: [
    {
      name: "name",
      label: "姓名",
      type: "text",
      required: true,
    },
    {
      name: "role",
      label: "职位",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "邮箱",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "company",
      label: "公司",
      type: "text",
      required: true,
    },
    {
      name: "contact",
      label: "联系方式",
      type: "text",
      required: true,
      admin: {
        description: "网站 / WhatsApp / 电话 / 微信",
      },
    },
    {
      name: "country",
      label: "国家或地区",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "留言内容",
      type: "textarea",
      required: true,
    },
    {
      name: "status",
      label: "处理状态",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "待处理", value: "pending" },
        { label: "已联系", value: "contacted" },
        { label: "已解决", value: "resolved" },
        { label: "垃圾信息", value: "spam" },
      ],
    },
    {
      name: "notes",
      label: "内部备注",
      type: "textarea",
      admin: {
        description: "仅后台可见，不会展示给提交人。",
      },
    },
  ],
};
