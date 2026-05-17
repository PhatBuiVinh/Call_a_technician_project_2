import { useState, useEffect } from 'react'
import { getBlogPost, urlFor } from '../lib/sanityClient'
import blogDemoImage from '../assets/blog/blogdemo.jpg'

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

        let imageUrl = blogDemoImage
        if (postData.mainImage && urlFor) {
          try {
            imageUrl = urlFor(postData.mainImage).width(1200).url()
          } catch {
            imageUrl = blogDemoImage
          }
        }

        let categoryTitle = 'General'
        if (postData.categories?.length > 0 && postData.categories[0]?.title) {
          categoryTitle = postData.categories[0].title
        }

        let authorName = 'Mustafa Kadir'
        let authorBio = ''
        if (postData.author?.name) {
          authorName = postData.author.name
          authorBio = typeof postData.author.bio === 'string' ? postData.author.bio : ''
        } else if (typeof postData.author === 'string' && postData.author) {
          authorName = postData.author
        }

        setPost({
          id: postData.slug?.current || postData._id || 'unknown',
          title: postData.title || 'Untitled Post',
          excerpt: postData.excerpt || '',
          category: categoryTitle,
          author: authorName,
          authorBio: authorBio,
          date: postData.publishedAt || new Date().toISOString(),
          readMins: postData.readMins || 5,
          image: imageUrl,
          featured: postData.featured || false,
          content: Array.isArray(postData.body) ? postData.body : []
        })
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
