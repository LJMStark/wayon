import {defineField, defineType} from 'sanity'

export const externalVideoMediaType = defineType({
  name: 'externalVideoMedia',
  title: 'External Video Media',
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
      name: 'posterUrl',
      title: 'Poster URL',
      type: 'string',
    }),
    defineField({
      name: 'titleZh',
      title: 'Title (ZH)',
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
      title: 'titleZh',
      subtitle: 'sourcePath',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'External video',
        subtitle,
      }
    },
  },
})
