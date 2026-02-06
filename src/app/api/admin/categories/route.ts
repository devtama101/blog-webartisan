import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    const category = await db.category.create({
      data: {
        name,
        slug: categorySlug,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
