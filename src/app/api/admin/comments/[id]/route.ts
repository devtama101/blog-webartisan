import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'approve':
        const approved = await db.comment.update({
          where: { id },
          data: { status: 'APPROVED' },
        })
        return NextResponse.json(approved)

      case 'spam':
        const spam = await db.comment.update({
          where: { id },
          data: { status: 'SPAM' },
        })
        return NextResponse.json(spam)

      case 'pending':
        const pending = await db.comment.update({
          where: { id },
          data: { status: 'PENDING' },
        })
        return NextResponse.json(pending)

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Comment patch error:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
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
    await db.comment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
