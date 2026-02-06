import { MetadataRoute } from 'next'
import { db } from '@/db'

const POSTS_PER_PAGE = 6

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'

  // Fetch all published posts
  const posts = await db.post.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
  })

  // Fetch all categories
  const categories = await db.category.findMany({
    select: {
      slug: true,
    },
  })

  // Fetch all tags
  const tags = await db.tag.findMany({
    select: {
      slug: true,
    },
  })

  // Calculate total pages for pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Paginated pages (page 2 and beyond, since page 1 is the homepage)
  const paginatedPages: MetadataRoute.Sitemap = []
  for (let page = 2; page <= totalPages; page++) {
    paginatedPages.push({
      url: `${baseUrl}/page/${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })
  }

  // Blog posts
  const postsSitemap: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: post.publishedAt || post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category pages
  const categoriesSitemap: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Tag pages
  const tagsSitemap: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...paginatedPages, ...postsSitemap, ...categoriesSitemap, ...tagsSitemap]
}
