import {defineField, defineType} from 'sanity'

import {TRADE_SERIES_TYPES} from '@/features/products/lib/tradeCatalog'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (Multi-language)',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
    }),
    defineField({
      name: 'normalizedName',
      title: 'Normalized Name',
      type: 'string',
      description: 'Deterministic family name used for imported trade materials.',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description:
        'Controls whether the product is visible on the public site. Imported trade products are auto-published. Manually created products default to unpublished — flip this on once content is ready.',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description (Multi-language)',
      type: 'localeString',
    }),
    defineField({
      name: 'seriesTypes',
      title: 'Series Types',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: TRADE_SERIES_TYPES.map((value) => ({title: value, value})),
      },
    }),
    defineField({
      name: 'catalogMode',
      title: 'Catalog Mode',
      type: 'string',
      options: {
        list: [
          {title: 'Standard Product', value: 'standard'},
          {title: 'Custom Product', value: 'custom'},
        ],
      },
      initialValue: 'standard',
    }),
    defineField({
      name: 'customCapability',
      title: 'Custom Capability',
      type: 'reference',
      to: [{type: 'customCapability'}],
      hidden: ({document}) => document?.catalogMode !== 'custom',
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Cover Image URL',
      type: 'string',
    }),
    defineField({
      name: 'coverVideoPosterUrl',
      title: 'Cover Video Poster URL',
      type: 'string',
    }),
    defineField({
      name: 'thickness',
      title: 'Thickness',
      type: 'string',
      description: 'e.g. 15mm / 20mm / 30mm',
    }),
    defineField({
      name: 'finish',
      title: 'Surface Finish',
      type: 'string',
      options: {
        list: [
          {title: 'Polished', value: 'polished'},
          {title: 'Honed', value: 'honed'},
          {title: 'Leathered', value: 'leathered'},
          {title: 'Brushed', value: 'brushed'},
          {title: 'Sandblasted', value: 'sandblasted'},
        ],
      },
    }),
    defineField({
      name: 'size',
      title: 'Slab Size',
      type: 'string',
      description: 'e.g. 3200x1600mm',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show on homepage carousel',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title.zh',
      subtitle: 'category.title',
      media: 'image',
      normalizedName: 'normalizedName',
    },
    prepare({title, subtitle, media, normalizedName}) {
      return {
        title: title || normalizedName || 'Untitled product',
        subtitle: subtitle || normalizedName,
        media,
      }
    },
  },
})
