import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          author: {
            select: { name: true, email: true },
          },
          categories: {
            select: { name: true, slug: true },
          },
          tags: {
            select: { name: true, slug: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      db.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Posts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, postIds } = body

    if (!action || !Array.isArray(postIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Bulk actions
    switch (action) {
      case 'delete':
        await db.post.deleteMany({
          where: { id: { in: postIds } },
        })
        break

      case 'archive':
        await db.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: 'ARCHIVED' },
        })
        break

      case 'restore':
        await db.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: 'DRAFT' },
        })
        break

      case 'publish':
        await db.post.updateMany({
          where: { id: { in: postIds } },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Posts bulk action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}
