import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.media.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
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

    const media = await db.media.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Media update error:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}
