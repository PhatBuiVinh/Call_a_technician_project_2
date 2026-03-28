import { useState, useEffect } from 'react'
import { getBlogPosts, getCategories, urlFor } from '../lib/sanityClient'

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
        
        // Transform data to match current structure
        const transformedPosts = postsData.map(post => ({
          id: post.slug?.current || post.id,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category?.title || 'Tips',
          author: post.author,
          date: post.date,
          readMins: post.readMins,
          image: post.image && urlFor ? urlFor(post.image).url() : '/src/assets/blog/blogdemo.jpg',
          featured: post.featured,
          content: post.content || []
        }))

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
