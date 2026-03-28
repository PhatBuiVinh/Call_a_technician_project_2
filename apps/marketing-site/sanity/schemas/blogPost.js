export default {
  title: 'Blog Post',
  name: 'blogPost',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required().min(3).max(100),
    },
    {
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    },
    {
      name: 'excerpt',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().min(10).max(200),
    },
    {
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'author',
      type: 'string',
      initialValue: 'Alex T.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'date',
      type: 'datetime',
      initialValue: new Date().toISOString(),
      validation: Rule => Rule.required(),
    },
    {
      name: 'readMins',
      type: 'number',
      initialValue: 5,
      validation: Rule => Rule.required().min(1).max(30),
    },
    {
      name: 'featured',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: Rule => Rule.required(),
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      initialValue: new Date().toISOString(),
    },
    {
      name: 'status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: ['draft', 'published', 'unpublished'],
        layout: 'radio',
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'image',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, author, media, publishedAt } = selection
      return {
        title,
        subtitle: `By ${author} • ${new Date(publishedAt).toLocaleDateString()}`,
        media,
      }
    },
  },
}
