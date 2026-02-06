'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  similarity: number
}

interface RelatedPostsProps {
  currentSlug: string
}

export function RelatedPosts({ currentSlug }: RelatedPostsProps) {
  const [posts, setPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/${currentSlug}/related`)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentSlug])

  if (loading) {
    return (
      <div className="border-t pt-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="border-t pt-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/${post.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <span className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block">
              Read more →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
