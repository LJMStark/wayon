import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

const lowercaseEmail: CollectionBeforeChangeHook = async ({ data }) => {
  if (data && typeof data.email === "string") {
    data.email = data.email.toLowerCase();
  }
  return data;
};

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
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
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "company",
      type: "text",
      required: true,
    },
    {
      name: "contact",
      type: "text",
      required: true,
      admin: {
        description: "Website / WhatsApp / Phone / WeChat",
      },
    },
    {
      name: "country",
      type: "text",
      required: true,
    },
    {
      name: "message",
      type: "textarea",
      required: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Contacted", value: "contacted" },
        { label: "Resolved", value: "resolved" },
        { label: "Spam", value: "spam" },
      ],
    },
    {
      name: "notes",
      type: "textarea",
      admin: {
        description: "Internal notes — not visible to submitter",
      },
    },
  ],
};
