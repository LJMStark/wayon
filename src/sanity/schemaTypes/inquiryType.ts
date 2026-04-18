import {BlockContentIcon, CheckmarkCircleIcon, ClockIcon, EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const STATUS_OPTIONS = [
  {title: 'Pending', value: 'pending'},
  {title: 'Contacted', value: 'contacted'},
  {title: 'Resolved', value: 'resolved'},
  {title: 'Spam', value: 'spam'},
] as const

const STATUS_ICONS = {
  pending: ClockIcon,
  contacted: EnvelopeIcon,
  resolved: CheckmarkCircleIcon,
  spam: BlockContentIcon,
} as const

type InquiryStatus = keyof typeof STATUS_ICONS

export const inquiryType = defineType({
  name: 'inquiry',
  title: 'Inquiry',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contact',
      title: 'Contact (Website/WhatsApp/Phone/WeChat)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [...STATUS_OPTIONS],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'Internal notes',
      type: 'text',
      rows: 4,
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      name: 'name',
      email: 'email',
      company: 'company',
      status: 'status',
    },
    prepare({name, email, company, status}) {
      const resolvedStatus = (status ?? 'pending') as InquiryStatus
      const statusLabel = resolvedStatus.toUpperCase()
      const subtitleParts = [`[${statusLabel}]`, company, email].filter(Boolean)
      const media = STATUS_ICONS[resolvedStatus]
      return {
        title: name || 'Untitled inquiry',
        subtitle: subtitleParts.join(' · '),
        media,
      }
    },
  },
})
