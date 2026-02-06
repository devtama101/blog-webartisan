'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Search,
  Upload,
  Grid3x3,
  List,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  File,
} from 'lucide-react'

interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt: string | null
  width: number | null
  height: number | null
  createdAt: string
}

type ViewMode = 'grid' | 'list'

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  async function fetchMedia() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          setMedia((prev) => [result, ...prev])
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMedia((prev) => prev.filter((item) => item.id !== id))
        if (selectedItem?.id === id) {
          setSelectedItem(null)
        }
        setSelectedItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  async function handleBulkDelete() {
    if (selectedItems.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} file(s)?`)) {
      return
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) =>
          fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
        )
      )

      setMedia((prev) => prev.filter((item) => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
    } catch (error) {
      console.error('Bulk delete error:', error)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    // In a real implementation, you'd pass this to the API
    // For now, we'll just filter client-side
  }

  const filteredMedia = media.filter((item) =>
    item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.alt && item.alt.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const isImage = (mimeType: string) => mimeType.startsWith('image/')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage images and files for your posts
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Files'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2',
                viewMode === 'grid'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2',
                viewMode === 'list'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.size} file(s) selected
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkDelete}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Media Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading media...</div>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No files match your search' : 'No files uploaded yet'}
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'bg-card rounded-lg border',
            viewMode === 'grid'
              ? 'p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'divide-y'
          )}
        >
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative group cursor-pointer',
                viewMode === 'list' && 'p-4 flex items-center gap-4 hover:bg-muted/50',
                selectedItems.has(item.id) && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => setSelectedItem(item)}
            >
              {/* Selection checkbox */}
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={(e) => {
                  e.stopPropagation()
                  const newSet = new Set(selectedItems)
                  if (newSet.has(item.id)) {
                    newSet.delete(item.id)
                  } else {
                    newSet.add(item.id)
                  }
                  setSelectedItems(newSet)
                }}
                className={cn(
                  'absolute top-2 left-2 rounded',
                  viewMode === 'list' && 'static'
                )}
              />

              {/* Thumbnail */}
              {isImage(item.mimeType) ? (
                <div
                  className={cn(
                    'aspect-square rounded-lg overflow-hidden bg-muted',
                    viewMode === 'list' && 'h-16 w-16 flex-shrink-0'
                  )}
                >
                  <img
                    src={item.url}
                    alt={item.alt || item.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    'aspect-square rounded-lg bg-muted flex items-center justify-center',
                    viewMode === 'list' && 'h-16 w-16 flex-shrink-0'
                  )}
                >
                  <File className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Info */}
              {viewMode === 'list' && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.originalName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(item.size)} • {item.mimeType}
                  </p>
                </div>
              )}

              {/* Quick actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Grid view label */}
              {viewMode === 'grid' && (
                <div className="mt-2">
                  <p className="text-sm truncate">{item.originalName}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{selectedItem.originalName}</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              {isImage(selectedItem.mimeType) && (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.alt || selectedItem.originalName}
                  className="w-full rounded-lg"
                />
              )}

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File name:</span>
                  <span>{selectedItem.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File size:</span>
                  <span>{formatFileSize(selectedItem.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{selectedItem.mimeType}</span>
                </div>
                {selectedItem.width && selectedItem.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span>
                      {selectedItem.width} × {selectedItem.height}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span>
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedItem.url)
                    alert('URL copied to clipboard!')
                  }}
                >
                  Copy URL
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedItem.id)
                    setSelectedItem(null)
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
