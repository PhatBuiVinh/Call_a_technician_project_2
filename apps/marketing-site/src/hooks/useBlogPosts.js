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
        
        // Transform data to match current structure with graceful fallbacks
        const transformedPosts = postsData.map(post => {
          // Handle image - could be 'image' or 'mainImage'
          const imageField = post.mainImage || post.image
          let imageUrl = '/src/assets/blog/blogdemo.jpg'
          if (imageField && urlFor) {
            try {
              const urlBuilder = urlFor(imageField)
              imageUrl = urlBuilder ? urlBuilder.url() : '/src/assets/blog/blogdemo.jpg'
            } catch (error) {
              console.error('Error building image URL:', error)
            }
          }
          
          // Handle categories - could be 'category' (single) or 'categories' (array)
          let categoryTitle = 'Uncategorized'
          if (post.categories && Array.isArray(post.categories) && post.categories.length > 0) {
            // Use first category from categories array
            const firstCat = post.categories[0]
            if (firstCat && typeof firstCat.title === 'string') {
              categoryTitle = firstCat.title
            }
          } else if (post.category && typeof post.category === 'object') {
            // Use single category
            if (typeof post.category.title === 'string') {
              categoryTitle = post.category.title
            }
          }
          
          // Extract author name - could be string or expanded reference
          let authorName = 'Unknown Author'
          if (post.author && typeof post.author === 'object') {
            if (typeof post.author.name === 'string') {
              authorName = post.author.name
            }
          } else if (typeof post.author === 'string' && post.author) {
            authorName = post.author
          }
          
          // Extract readMins
          let readTime = 5
          if (post.readMins && typeof post.readMins === 'number') {
            readTime = post.readMins
          }
          
          // Handle content - could be 'content' or 'body'
          const contentField = post.body || post.content
          
          // Use publishedAt as date if date is missing
          const dateField = post.date || post.publishedAt
          
          const transformed = {
            id: post.slug?.current || post._id || 'unknown',
            title: post.title || 'Untitled Post',
            category: categoryTitle,
            author: authorName,
            date: dateField || new Date().toISOString(),
            readMins: readTime,
            image: imageUrl,
            featured: post.featured || false,
            content: Array.isArray(contentField) ? contentField : []
          }
          
          return transformed
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
