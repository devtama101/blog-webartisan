import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Tags API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name if not provided
    const tagSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    const tag = await db.tag.create({
      data: {
        name,
        slug: tagSlug,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Tag create error:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
