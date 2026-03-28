import { useState, useEffect } from 'react'
import { getBlogPost, urlFor } from '../lib/sanityClient'

export function useBlogPost(slug) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    async function fetchPost() {
      try {
        setLoading(true)
        const postData = await getBlogPost(slug)
        
        if (!postData) {
          setPost(null)
          return
        }

        // Transform data to match current structure with graceful fallbacks
        // Handle image - could be 'image' or 'mainImage'
        const imageField = postData.mainImage || postData.image
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
        if (postData.categories && Array.isArray(postData.categories) && postData.categories.length > 0) {
          const firstCat = postData.categories[0]
          if (firstCat && typeof firstCat.title === 'string') {
            categoryTitle = firstCat.title
          }
        } else if (postData.category && typeof postData.category === 'object') {
          if (typeof postData.category.title === 'string') {
            categoryTitle = postData.category.title
          }
        }
        
        // Extract author name and bio - could be string or expanded reference
        // Bio could be string or Portable Text (array of blocks)
        let authorName = 'Unknown Author'
        let authorBio = ''
        if (postData.author && typeof postData.author === 'object') {
          if (typeof postData.author.name === 'string') {
            authorName = postData.author.name
          }
          // Bio could be string or Portable Text array
          if (typeof postData.author.bio === 'string') {
            authorBio = postData.author.bio
          } else if (Array.isArray(postData.author.bio) && postData.author.bio.length > 0) {
            // Extract text from Portable Text blocks
            authorBio = postData.author.bio
              .map(block => {
                if (block.children && Array.isArray(block.children)) {
                  return block.children.map(child => child.text || '').join('')
                }
                return ''
              })
              .join(' ')
          }
        } else if (typeof postData.author === 'string' && postData.author) {
          authorName = postData.author
        }
        
        // Extract readMins
        let readTime = 5
        if (postData.readMins && typeof postData.readMins === 'number') {
          readTime = postData.readMins
        }
        
        // Handle content - could be 'content' or 'body'
        const contentField = postData.body || postData.content
        
        // Use publishedAt as date if date is missing
        const dateField = postData.date || postData.publishedAt
        
        const transformedPost = {
          id: postData.slug?.current || postData._id || 'unknown',
          title: postData.title || 'Untitled Post',
          category: categoryTitle,
          author: authorName,
          authorBio: authorBio,
          date: dateField || new Date().toISOString(),
          readMins: readTime,
          image: imageUrl,
          featured: postData.featured || false,
          content: Array.isArray(contentField) ? contentField : []
        }

        setPost(transformedPost)
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  return { post, loading, error }
}
