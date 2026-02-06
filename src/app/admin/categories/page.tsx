'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Folder,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: { posts: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingId) {
        await fetch(`/api/admin/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      fetchCategories()
      resetForm()
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setFormData({ name: category.name, slug: category.slug })
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
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your posts with categories
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Category' : 'New Category'}
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
                placeholder="Technology"
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
                placeholder="technology"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Update' : 'Create'} Category
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-card rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No categories yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first category
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      /{category.slug} • {category._count.posts} post{category._count.posts !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
