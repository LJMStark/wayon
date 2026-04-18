import {defineField, defineType} from 'sanity'

import {chineseSlugify} from '@/sanity/lib/slugify'

export const newsType = defineType({
  name: 'news',
  title: 'News',
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
        // zh is the primary editing locale; title.en is only a legacy
        // fallback for documents that lack a Chinese title.
        source: (doc: Record<string, unknown>) => {
          const title = doc.title as Record<string, string> | undefined;
          return title?.zh || title?.en || '';
        },
        slugify: chineseSlugify,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt (Multi-language)',
      type: 'localeString',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Company News', value: 'company'},
          {title: 'Industry News', value: 'industry'},
          {title: 'Exhibition', value: 'exhibition'},
          {title: 'Product Launch', value: 'product'},
        ],
      },
    }),
    defineField({
      name: 'body',
      title: 'Body (Multi-language)',
      type: 'object',
      fields: [
        defineField({name: 'en', title: 'English', type: 'array', of: [{type: 'block'}, {type: 'image'}]}),
        defineField({name: 'zh', title: 'Chinese', type: 'array', of: [{type: 'block'}, {type: 'image'}]}),
        defineField({name: 'es', title: 'Spanish', type: 'array', of: [{type: 'block'}, {type: 'image'}]}),
        defineField({name: 'ar', title: 'Arabic', type: 'array', of: [{type: 'block'}, {type: 'image'}]}),
        defineField({name: 'ru', title: 'Russian', type: 'array', of: [{type: 'block'}, {type: 'image'}]}),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'category',
      media: 'coverImage',
    },
  },
})
