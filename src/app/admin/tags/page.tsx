'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tag as TagIcon,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
  _count: { posts: number }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '' })

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingId) {
        await fetch(`/api/admin/tags/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/admin/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      fetchTags()
      resetForm()
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
      setTags((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setFormData({ name: tag.name, slug: tag.slug })
    setShowForm(true)
  }

  function resetForm() {
    setEditingId(null)
    setFormData({ name: '', slug: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Add descriptive tags to your posts
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Tag
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Tag' : 'New Tag'}
            </h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                placeholder="React"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  setFormData({
                    name,
                    slug: editingId ? formData.slug : name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
                  })
                }}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                placeholder="react"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Update' : 'Create'} Tag
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tags Grid */}
      <div className="bg-card rounded-lg border p-6">
        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No tags yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first tag
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 transition-colors"
              >
                <span className="text-sm font-medium">{tag.name}</span>
                <span className="text-xs text-muted-foreground">({tag._count.posts})</span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(tag)}
                    className="p-0.5 hover:bg-background rounded"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-0.5 hover:bg-background rounded text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
