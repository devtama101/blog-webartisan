import { Post } from '@prisma/client'

export interface JsonLdProps {
  type?: 'Article' | 'BlogPosting' | 'BreadcrumbList'
  data?: any
}

/**
 * Generate JSON-LD structured data for a blog post
 * This helps search engines understand the content and display rich snippets
 */
export function generateArticleSchema(post: {
  title: string
  excerpt?: string | null
  content: string
  coverImage?: string | null
  publishedAt?: Date | string | null
  updatedAt?: Date | string
  slug: string
  author?: {
    name?: string | null
    email?: string | null
  } | null
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'
  const url = `${baseUrl}/${post.slug}`
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toISOString()
    : new Date().toISOString()
  const modifiedDate = post.updatedAt
    ? new Date(post.updatedAt).toISOString()
    : publishedDate

  // Clean content for description (strip markdown, limit length)
  const cleanContent = post.content
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/`{1,3}/g, '') // Remove code blocks
    .substring(0, 200) // Limit to 200 chars

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || cleanContent,
    image: post.coverImage || `${baseUrl}/og-image.png`,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Admin',
      email: post.author?.email || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'WebArtisan Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    wordCount: post.content.split(/\s+/).length,
    inLanguage: 'en-US',
  }

  return schema
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }

  return schema
}

/**
 * Generate JSON-LD structured data for a website
 */
export function generateWebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WebArtisan Blog',
    url: baseUrl,
    description: 'A personal blog platform with insights on technology, development, and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return schema
}
