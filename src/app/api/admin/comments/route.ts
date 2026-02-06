import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      db.comment.count({ where }),
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, commentIds } = body

    if (!action || !Array.isArray(commentIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Bulk actions
    switch (action) {
      case 'approve':
        await db.comment.updateMany({
          where: { id: { in: commentIds } },
          data: { status: 'APPROVED' },
        })
        break

      case 'spam':
        await db.comment.updateMany({
          where: { id: { in: commentIds } },
          data: { status: 'SPAM' },
        })
        break

      case 'delete':
        await db.comment.deleteMany({
          where: { id: { in: commentIds } },
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
    console.error('Comments bulk action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}
