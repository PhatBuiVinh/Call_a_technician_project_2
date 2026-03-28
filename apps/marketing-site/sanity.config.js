import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Call-a-Technician Blog',

  projectId: 'your-project-id', // Replace with your Sanity project ID
  dataset: 'production',

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Blog')
          .items([
            S.listItem()
              .title('Blog Posts')
              .schemaType('blogPost')
              .icon(() => '📝')
              .child(S.documentTypeList('blogPost').title('Blog Posts')),
            S.divider(),
            S.listItem()
              .title('Categories')
              .schemaType('category')
              .icon(() => '🏷️')
              .child(S.documentTypeList('category').title('Categories')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
