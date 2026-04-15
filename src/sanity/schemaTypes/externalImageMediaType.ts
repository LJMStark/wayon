import {defineField, defineType} from 'sanity'

export const externalImageMediaType = defineType({
  name: 'externalImageMedia',
  title: 'External Image Media',
  type: 'object',
  fields: [
    defineField({
      name: 'sourcePath',
      title: 'Source Path',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publicUrl',
      title: 'Public URL',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'altZh',
      title: 'Alt Text (ZH)',
      type: 'string',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'altZh',
      subtitle: 'sourcePath',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'External image',
        subtitle,
      }
    },
  },
})
