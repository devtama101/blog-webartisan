import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query') || 'technology'

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Unsplash API error')
    }

    const data = await response.json()

    const results = data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.full,
      thumb: photo.urls.regular,
      full: photo.urls.full,
      description: photo.description || photo.alt_description || '',
      photographer: photo.user.name,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Unsplash error:', error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
