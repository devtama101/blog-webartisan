'use client'

import { useState, useEffect } from 'react'
import { parseYouTubeUrl, youtubeToPlaceholder } from '@/lib/youtube-parser'
import { X, Youtube as YoutubeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface YoutubeEmbedProps {
  url: string
  onInsert: (placeholder: string) => void
  onRemove: () => void
  className?: string
}

export function YoutubeEmbed({ url, onInsert, onRemove, className }: YoutubeEmbedProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  useEffect(() => {
    const id = parseYouTubeUrl(url)
    setVideoId(id)
    if (id) {
      setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`)
    } else {
      setThumbnail(null)
    }
  }, [url])

  useEffect(() => {
    if (videoId) {
      onInsert(youtubeToPlaceholder(url))
    }
  }, [videoId, url, onInsert])

  if (!videoId || !thumbnail) {
    return null
  }

  return (
    <div className={cn('relative group', className)}>
      <div className="inline-block rounded-lg overflow-hidden border">
        <div className="relative">
          <img
            src={thumbnail}
            alt="YouTube thumbnail"
            className="block max-w-xs"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
              <YoutubeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-muted text-xs text-muted-foreground">
          youtube.com/watch?v={videoId}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface YoutubePreviewProps {
  placeholder: string
  className?: string
}

export function YoutubePreview({ placeholder, className }: YoutubePreviewProps) {
  const videoId = placeholder.match(/\{\{youtube:([^}]+)\}\}/)?.[1]

  if (!videoId) {
    return null
  }

  return (
    <div className={cn('inline-block rounded-lg overflow-hidden border', className)}>
      <div className="relative">
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt="YouTube thumbnail"
          className="block max-w-xs"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
            <YoutubeIcon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      <div className="px-2 py-1 bg-muted text-xs text-muted-foreground">
        YouTube: {videoId}
      </div>
    </div>
  )
}
