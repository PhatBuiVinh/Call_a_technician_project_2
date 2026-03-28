export default {
  title: 'Category',
  name: 'category',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required().unique(),
    },
    {
      name: 'description',
      type: 'text',
      rows: 2,
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      const { title } = selection
      return {
        title,
        subtitle: 'Category',
      }
    },
  },
}
