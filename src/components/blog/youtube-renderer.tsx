'use client'

import { parseYouTubePlaceholder } from '@/lib/youtube-parser'
import { cn } from '@/lib/utils'

interface YoutubeRendererProps {
  placeholder: string
  className?: string
}

export function YoutubeRenderer({ placeholder, className }: YoutubeRendererProps) {
  const videoId = parseYouTubePlaceholder(placeholder)

  if (!videoId) {
    return null
  }

  return (
    <div className={cn('youtube-embed', className)}>
      <div className="aspect-video overflow-hidden rounded-lg">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>
  )
}

interface YoutubeEmbedParserProps {
  content: string
  className?: string
}

/**
 * Parses content for YouTube placeholders and renders them as embedded videos
 * Non-YouTube content is rendered as paragraphs
 */
export function YoutubeEmbedParser({ content, className }: YoutubeEmbedParserProps) {
  const parts: Array<{ type: 'text' | 'youtube'; content: string }> = []

  // Split content by YouTube placeholders
  let remaining = content
  const placeholderRegex = /\{\{youtube:([^}]+)\}\}/g

  let match
  let lastIndex = 0

  while ((match = placeholderRegex.exec(content)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index).trim()
      if (textContent) {
        parts.push({ type: 'text', content: textContent })
      }
    }

    // Add the YouTube placeholder
    parts.push({ type: 'youtube', content: match[0] })
    lastIndex = placeholderRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex).trim()
    if (textContent) {
      parts.push({ type: 'text', content: textContent })
    }
  }

  // If no placeholders found, return original content as text
  if (parts.length === 0) {
    return <div className={className}>{content}</div>
  }

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === 'youtube') {
          return <YoutubeRenderer key={index} placeholder={part.content} />
        }
        return (
          <p key={index} className="mb-4 last:mb-0">
            {part.content}
          </p>
        )
      })}
    </div>
  )
}
