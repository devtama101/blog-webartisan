'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Search,
  Trash2,
  Archive,
  RefreshCw,
  Check,
  MoreHorizontal,
  Plus,
  Image,
} from 'lucide-react'

type PostStatus = 'all' | 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  coverImage: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  author: { name: string | null; email: string }
  categories: Array<{ name: string }>
  tags: Array<{ name: string }>
  _count: { comments: number }
}

interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const statusFilters: { value: PostStatus; label: string }[] = [
  { value: 'all', label: 'All Posts' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<PostStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchPosts()
  }, [statusFilter, pagination.page])

  async function fetchPosts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const response = await fetch(`/api/admin/posts?${params}`)
      if (response.ok) {
        const data: PostsResponse = await response.json()
        setPosts(data.posts)
        setPagination(data.pagination)
        setSelectedPosts(new Set())
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectPost(id: string) {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPosts(newSelected)
  }

  function handleSelectAll() {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)))
    }
  }

  async function handleBulkAction(action: 'delete' | 'archive' | 'restore' | 'publish') {
    if (selectedPosts.size === 0) return

    if (!confirm(`Are you sure you want to ${action} ${selectedPosts.size} post(s)?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          postIds: Array.from(selectedPosts),
        }),
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPagination((p) => ({ ...p, page: 1 }))
    fetchPosts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value)
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                statusFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search posts..."
              className="pl-10 pr-4 py-2 text-sm border rounded-lg bg-background w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">
            {selectedPosts.size} post(s) selected
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction('publish')}
          >
            <Check className="h-4 w-4 mr-1" />
            Publish
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction('archive')}
          >
            <Archive className="h-4 w-4 mr-1" />
            Archive
          </Button>
          {statusFilter === 'ARCHIVED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('restore')}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Restore
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction('delete')}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No posts found</p>
            <Link href="/admin/posts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create your first post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedPosts.size === posts.length && posts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Date
                  </th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className={cn(
                      'hover:bg-muted/50 transition-colors',
                      selectedPosts.has(post.id) && 'bg-muted/50'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPosts.has(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="h-10 w-10 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Image className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="font-medium hover:text-primary transition-colors block truncate"
                          >
                            {post.title}
                          </Link>
                          {post.categories.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {post.categories.map((cat) => (
                                <span
                                  key={cat.name}
                                  className="text-xs text-muted-foreground"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status as any} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {post.author.name || post.author.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-accent rounded">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} posts
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
