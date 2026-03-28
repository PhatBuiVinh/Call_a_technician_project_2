import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Check if Sanity is configured
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET

// Fallback to mock data if Sanity is not configured
const isSanityConfigured = projectId && projectId !== 'your-project-id'

// Sanity client configuration
export const client = isSanityConfigured ? createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: '2024-01-01',
}) : null

// Helper for building image URLs
const builder = imageUrlBuilder(client)
export const urlFor = (source) => client ? builder.image(source) : null

// Mock data fallback
const mockPosts = [
  {
    id: 'demo-post',
    title: 'Blog Coming Soon',
    excerpt: 'Blog posts will appear here once Sanity CMS is configured.',
    category: 'Tips',
    author: 'Admin',
    date: new Date().toISOString(),
    readMins: 1,
    image: '/src/assets/blog/blogdemo.jpg',
    featured: true,
    content: [
      { type: 'p', text: 'Please configure Sanity CMS to see blog posts here.' }
    ]
  }
]

const mockCategories = ['Tips', 'Troubleshooting', 'Security', 'Wi-Fi', 'Business IT']

// Helper to fetch blog posts
export const getBlogPosts = async () => {
  if (!isSanityConfigured) {
    console.log('Sanity not configured - using mock data')
    return mockPosts
  }

  const query = `*[_type == "blogPost" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    content,
    category->{title},
    author,
    date,
    readMins,
    featured,
    image,
    publishedAt
  }`
  
  return await client.fetch(query)
}

// Helper to fetch single blog post by slug
export const getBlogPost = async (slug) => {
  if (!isSanityConfigured) {
    console.log('Sanity not configured - using mock data')
    return mockPosts[0]
  }

  const query = `*[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    category->{title},
    author,
    date,
    readMins,
    featured,
    image,
    publishedAt
  }`
  
  return await client.fetch(query, { slug })
}

// Helper to fetch categories
export const getCategories = async () => {
  if (!isSanityConfigured) {
    console.log('Sanity not configured - using mock data')
    return mockCategories.map(title => ({ _id: title, title }))
  }

  const query = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    description
  }`
  
  return await client.fetch(query)
}
