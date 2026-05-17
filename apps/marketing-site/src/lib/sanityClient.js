import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import blogDemoImage from '../assets/blog/blogdemo.jpg'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET

const isSanityConfigured = projectId && projectId !== 'your-project-id'

export const client = isSanityConfigured ? createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: '2024-01-01',
}) : null

const builder = isSanityConfigured ? imageUrlBuilder(client) : null
export const urlFor = (source) => builder ? builder.image(source) : null

// Fallback shown when Sanity is not connected
const mockPosts = [
  {
    id: 'demo-post',
    title: 'Blog Coming Soon',
    excerpt: 'Blog posts will appear here once content is added.',
    category: 'Tips',
    author: 'Mustafa Kadir',
    date: new Date().toISOString(),
    readMins: 1,
    image: blogDemoImage,
    featured: true,
    content: []
  }
]

const mockCategories = ['Tips', 'Security', 'Wi-Fi & Networking', 'Cybersecurity']

export const getBlogPosts = async () => {
  if (!isSanityConfigured) return mockPosts

  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    body,
    excerpt,
    categories[]->{title},
    author,
    publishedAt,
    readMins,
    featured,
    mainImage,
    status
  }`

  try {
    return await client.fetch(query)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export const getBlogPost = async (slug) => {
  if (!isSanityConfigured) return mockPosts[0]

  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    excerpt,
    categories[]->{title},
    author,
    publishedAt,
    readMins,
    featured,
    mainImage,
    status
  }`

  try {
    return await client.fetch(query, { slug })
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export const getCategories = async () => {
  if (!isSanityConfigured) {
    return mockCategories.map(title => ({ _id: title, title }))
  }

  const query = `*[_type == "category"] | order(title asc) { _id, title }`
  try {
    return await client.fetch(query)
  } catch {
    return []
  }
}
