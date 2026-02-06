'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Search,
  Check,
  AlertOctagon,
  Trash2,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'

type CommentStatus = 'all' | 'PENDING' | 'APPROVED' | 'SPAM'

interface Comment {
  id: string
  authorName: string
  authorEmail: string
  content: string
  status: string
  createdAt: string
  post: {
    id: string
    title: string
    slug: string
  }
}

interface CommentsResponse {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const statusFilters: { value: CommentStatus; label: string; color: string }[] = [
  { value: 'all', label: 'All Comments', color: '' },
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'SPAM', label: 'Spam', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
]

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<CommentStatus>('all')
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchComments()
  }, [statusFilter, pagination.page])

  async function fetchComments() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      const response = await fetch(`/api/admin/comments?${params}`)
      if (response.ok) {
        const data: CommentsResponse = await response.json()
        setComments(data.comments)
        setPagination(data.pagination)
        setSelectedComments(new Set())
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectComment(id: string) {
    const newSelected = new Set(selectedComments)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedComments(newSelected)
  }

  function handleSelectAll() {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set())
    } else {
      setSelectedComments(new Set(comments.map((c) => c.id)))
    }
  }

  async function handleBulkAction(action: 'approve' | 'spam' | 'delete') {
    if (selectedComments.size === 0) return

    if (!confirm(`Are you sure you want to ${action} ${selectedComments.size} comment(s)?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          commentIds: Array.from(selectedComments),
        }),
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  async function handleQuickAction(id: string, action: 'approve' | 'spam' | 'delete') {
    try {
      if (action === 'delete') {
        await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
      } else {
        await fetch(`/api/admin/comments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
      }
      fetchComments()
    } catch (error) {
      console.error('Quick action error:', error)
    }
  }

  const statusColor = (status: string) => {
    const filter = statusFilters.find((f) => f.value === status)
    return filter?.color || ''
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-muted-foreground">
            Moderate and manage user comments
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-1 overflow-x-auto pb-2">
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

      {/* Bulk Actions */}
      {selectedComments.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">
            {selectedComments.size} comment(s) selected
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction('approve')}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction('spam')}
          >
            <AlertOctagon className="h-4 w-4 mr-1" />
            Mark as Spam
          </Button>
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

      {/* Comments List */}
      <div className="bg-card rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No comments found
          </div>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'p-4 hover:bg-muted/30 transition-colors',
                  selectedComments.has(comment.id) && 'bg-muted/50'
                )}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedComments.has(comment.id)}
                    onChange={() => handleSelectComment(comment.id)}
                    className="mt-1 rounded"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author & Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{comment.authorName}</span>
                      <span className="text-sm text-muted-foreground">
                        {comment.authorEmail}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          statusColor(comment.status)
                        )}
                      >
                        {comment.status.toLowerCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Comment text */}
                    <p className="mt-2 text-sm">{comment.content}</p>

                    {/* Post link */}
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <span>on</span>
                      <Link
                        href={`/blog/${comment.post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary flex items-center gap-1"
                      >
                        {comment.post.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-1">
                    {comment.status !== 'APPROVED' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuickAction(comment.id, 'approve')}
                        title="Approve"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {comment.status !== 'SPAM' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuickAction(comment.id, 'spam')}
                        title="Mark as Spam"
                      >
                        <AlertOctagon className="h-4 w-4 text-yellow-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuickAction(comment.id, 'delete')}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} comments
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
