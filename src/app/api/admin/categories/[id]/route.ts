import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const category = await db.category.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
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
    await db.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
