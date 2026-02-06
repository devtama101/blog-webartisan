import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db'
import { findLinkingSuggestions } from '@/lib/content-similarity'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { content, excludePostId } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Fetch all published posts
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        ...(excludePostId ? { id: { not: excludePostId } } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    // Find linking suggestions based on content
    const suggestions = findLinkingSuggestions(content, posts)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Internal links fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch internal links' }, { status: 500 })
  }
}
