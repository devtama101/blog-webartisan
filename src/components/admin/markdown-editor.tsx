'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  height?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Start writing your post...",
  disabled = false,
  height = 400
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="border rounded-lg p-4 min-h-[400px] flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        preview="edit"
        textareaProps={{
          placeholder,
          disabled
        }}
      />
    </div>
  )
}
