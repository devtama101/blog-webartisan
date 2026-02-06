import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db'

export const dynamic = 'force-dynamic'

const POSTS_PER_PAGE = 6
const MAX_LIMIT = 50

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    let limit = parseInt(searchParams.get('limit') || String(POSTS_PER_PAGE))

    // Clamp limit to reasonable bounds
    limit = Math.max(1, Math.min(MAX_LIMIT, limit))

    // Count total posts
    const total = await prisma.post.count({
      where: { status: 'PUBLISHED' }
    })

    const totalPages = Math.ceil(total / limit)

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch posts
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const pagination: PaginationInfo = {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

    return NextResponse.json({ posts, pagination })
  } catch (error) {
    console.error('Blog posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
