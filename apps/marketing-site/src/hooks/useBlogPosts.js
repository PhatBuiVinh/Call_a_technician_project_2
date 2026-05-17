import { useState, useEffect } from 'react'
import { getBlogPosts, getCategories, urlFor } from '../lib/sanityClient'
import blogDemoImage from '../assets/blog/blogdemo.jpg'

export function useBlogPosts() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const [postsData, categoriesData] = await Promise.all([
          getBlogPosts(),
          getCategories()
        ])
        
        // Transform data to match current structure with graceful fallbacks
        const transformedPosts = postsData.map(post => {
          let imageUrl = blogDemoImage
          if (post.mainImage && urlFor) {
            try {
              imageUrl = urlFor(post.mainImage).width(800).url()
            } catch {
              imageUrl = blogDemoImage
            }
          }

          let categoryTitle = 'General'
          if (post.categories?.length > 0 && post.categories[0]?.title) {
            categoryTitle = post.categories[0].title
          }

          let authorName = 'Mustafa Kadir'
          if (post.author?.name) {
            authorName = post.author.name
          } else if (typeof post.author === 'string' && post.author) {
            authorName = post.author
          }

          return {
            id: post.slug?.current || post._id || 'unknown',
            title: post.title || 'Untitled Post',
            excerpt: post.excerpt || '',
            category: categoryTitle,
            author: authorName,
            date: post.publishedAt || new Date().toISOString(),
            readMins: post.readMins || 5,
            image: imageUrl,
            featured: post.featured || false,
            content: Array.isArray(post.body) ? post.body : []
          }
        })

        const transformedCategories = categoriesData.map(cat => cat.title)

        setPosts(transformedPosts)
        setCategories(transformedCategories)
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { posts, categories, loading, error }
}
