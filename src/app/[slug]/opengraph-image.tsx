import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Fetch the post data - we need to do this differently
  // For now, use a fallback title based on slug
  const titleFromSlug = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '24px',
              color: 'white',
            }}
          >
            W
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#e2e8f0',
              letterSpacing: '-0.5px',
            }}
          >
            WebArtisan Blog
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'white',
              letterSpacing: '-2px',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {titleFromSlug}
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #06b6d4)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
