import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await db.post.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Post API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const post = await db.post.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.post.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'archive':
        const archived = await db.post.update({
          where: { id },
          data: { status: 'ARCHIVED' },
        })
        return NextResponse.json(archived)

      case 'restore':
        const restored = await db.post.update({
          where: { id },
          data: { status: 'DRAFT' },
        })
        return NextResponse.json(restored)

      case 'publish':
        const published = await db.post.update({
          where: { id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        })
        return NextResponse.json(published)

      case 'unpublish':
        const unpublished = await db.post.update({
          where: { id },
          data: { status: 'DRAFT' },
        })
        return NextResponse.json(unpublished)

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Post patch error:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}
