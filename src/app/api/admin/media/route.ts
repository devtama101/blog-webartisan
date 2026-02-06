import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.media.count({ where }),
    ])

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Media API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // For now, we'll store files as base64 data URLs
    // In production, you'd want to use a proper object storage service
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Get image dimensions if it's an image
    let width: number | null = null
    let height: number | null = null

    if (file.type.startsWith('image/')) {
      // For a real implementation, you'd use sharp or similar
      // For now, we'll skip dimension detection
    }

    const media = await db.media.create({
      data: {
        filename: `${Date.now()}-${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: dataUrl,
        alt,
        width,
        height,
      },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}
