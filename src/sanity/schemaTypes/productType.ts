import {defineField, defineType} from 'sanity'

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
      validation: (rule) => rule.required(),
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
      title: 'title.en',
      subtitle: 'category.title',
      media: 'image',
    },
  },
})
