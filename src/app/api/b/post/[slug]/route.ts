import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const { slug } = await context.params

  try {
    const post = await prisma.post.findUnique({
      where: {
        slug
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    if (!post || post.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
