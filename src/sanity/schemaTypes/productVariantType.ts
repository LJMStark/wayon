import {defineField, defineType} from 'sanity'

import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SIZES,
} from '@/features/products/lib/tradeCatalog'

export const productVariantType = defineType({
  name: 'productVariant',
  title: 'Product Variant',
  type: 'document',
  fields: [
    defineField({
      name: 'productRef',
      title: 'Product Family',
      type: 'reference',
      to: [{type: 'product'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Variant Code',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      options: {
        list: TRADE_SIZES.map((value) => ({title: value, value})),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thickness',
      title: 'Thickness',
      type: 'string',
    }),
    defineField({
      name: 'process',
      title: 'Process',
      type: 'string',
      options: {
        list: TRADE_PROCESSES.map((value) => ({title: value, value})),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'colorGroup',
      title: 'Color Group',
      type: 'string',
      options: {
        list: TRADE_COLOR_GROUPS.map((value) => ({title: value, value})),
      },
    }),
    defineField({
      name: 'faceCount',
      title: 'Face Count',
      type: 'string',
      description: 'For example: 单面 / 多面 / 四面',
    }),
    defineField({
      name: 'facePatternNote',
      title: 'Face Pattern Note',
      type: 'string',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'elementImages',
      title: 'Element Images',
      type: 'array',
      of: [{type: 'externalImageMedia'}],
    }),
    defineField({
      name: 'spaceImages',
      title: 'Space Images',
      type: 'array',
      of: [{type: 'externalImageMedia'}],
    }),
    defineField({
      name: 'realImages',
      title: 'Real Photos',
      type: 'array',
      of: [{type: 'externalImageMedia'}],
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [{type: 'externalVideoMedia'}],
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
    {
      title: 'Code',
      name: 'codeAsc',
      by: [{field: 'code', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'code',
      size: 'size',
      process: 'process',
      productTitle: 'productRef.title.zh',
    },
    prepare({title, size, process, productTitle}) {
      const subtitleParts = [productTitle, size, process].filter(Boolean)

      return {
        title,
        subtitle: subtitleParts.join(' / '),
      }
    },
  },
})
