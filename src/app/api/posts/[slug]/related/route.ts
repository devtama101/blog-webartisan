import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db'
import { findSimilarPosts } from '@/lib/content-similarity'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get the current post
    const currentPost = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
      },
    })

    if (!currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get all published posts
    const allPosts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: currentPost.id },
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        slug: true,
      },
    })

    // Find similar posts
    const relatedPosts = findSimilarPosts(currentPost, allPosts, 4)

    return NextResponse.json({ posts: relatedPosts })
  } catch (error) {
    console.error('Related posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch related posts' }, { status: 500 })
  }
}
