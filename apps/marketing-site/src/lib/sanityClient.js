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
    return mockPosts
  }

  // Query for both "blogPost" and "post" types to handle existing data
  const query = `*[_type in ["blogPost", "post"]] | order(publishedAt desc) {
    _id,
    title,
    slug,
    content,
    body,
    category->{title},
    categories[]->{title},
    author,
    author->{name, bio},
    date,
    publishedAt,
    readMins,
    featured,
    image,
    mainImage,
    status,
    _type
  }`
  
  try {
    const posts = await client.fetch(query)
    
    // Filter for published posts in JavaScript instead of GROQ
    // Treat null status as published for existing posts
    const publishedPosts = posts.filter(post => 
      post.status === 'published' || post.status === null
    )
    
    return publishedPosts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

// Helper to fetch single blog post by slug
export const getBlogPost = async (slug) => {
  if (!isSanityConfigured) {
    return mockPosts[0]
  }

  // Query for both "blogPost" and "post" types
  const query = `*[_type in ["blogPost", "post"]] | order(publishedAt desc) {
    _id,
    title,
    slug,
    content,
    body,
    category->{title},
    categories[]->{title},
    author,
    author->{name, bio},
    date,
    publishedAt,
    readMins,
    featured,
    image,
    mainImage,
    status,
    _type
  }`
  
  try {
    const posts = await client.fetch(query)
    
    // Find the post by slug OR _id, and status
    const post = posts.find(p => {
      const slugMatch = p.slug?.current === slug
      const idMatch = p._id === slug
      const statusMatch = p.status === 'published' || p.status === null
      return (slugMatch || idMatch) && statusMatch
    })
    
    return post
  } catch (error) {
    console.error('Error fetching single post:', error)
    return null
  }
}

// Helper to fetch categories
export const getCategories = async () => {
  if (!isSanityConfigured) {
    return mockCategories.map(title => ({ _id: title, title }))
  }

  const query = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    description
  }`
  
  return await client.fetch(query)
}
