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

        // Transform data to match current structure
        const transformedPost = {
          id: postData.slug?.current || postData.id,
          title: postData.title,
          excerpt: postData.excerpt,
          category: postData.category?.title || 'Tips',
          author: postData.author,
          date: postData.date,
          readMins: postData.readMins,
          image: postData.image && urlFor ? urlFor(postData.image).url() : '/src/assets/blog/blogdemo.jpg',
          featured: postData.featured,
          content: postData.content || []
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
