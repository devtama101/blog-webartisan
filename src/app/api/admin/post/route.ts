import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { title, content, excerpt, coverImage, published, metaTitle, metaDescription, ogImage, canonicalUrl } = await req.json()

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Get or create author (for now, using a fixed author)
    let author = await prisma.user.findFirst()
    if (!author) {
      throw new Error('No author found. Please seed the database first.')
    }

    const post = await prisma.post.create({
      data: {
        slug,
        title,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        coverImageSource: coverImage ? 'unsplash' : null,
        authorId: author.id,
        status: published ? 'PUBLISHED' : 'DRAFT',
        publishedAt: published ? new Date() : null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        canonicalUrl: canonicalUrl || null,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
