import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const tag = await db.tag.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Tag update error:', error)
    return NextResponse.json(
      { error: 'Failed to update tag' },
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
    await db.tag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tag delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
