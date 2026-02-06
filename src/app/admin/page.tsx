'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MetricCard } from '@/components/admin/metric-card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Eye,
  MessageSquare,
  Sparkles,
  Plus,
  TrendingUp,
} from 'lucide-react'

interface DashboardData {
  posts: {
    total: number
    published: number
    draft: number
    scheduled: number
    archived: number
  }
  views: {
    today: number
    week: number
    month: number
  }
  comments: {
    pending: number
  }
  aiUsage: {
    requestsToday: number
    tokensToday: number
  }
  topPosts: Array<{
    id: string
    title: string
    slug: string
    views: number
  }>
  recentActivity: Array<{
    id: string
    action: string
    entity: string
    createdAt: string
    user: { name: string | null; email: string }
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Failed to load dashboard</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your blog.
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Posts"
          value={data.posts.total}
          icon={FileText}
          trend={{
            value: `${data.posts.published} published`,
            direction: 'neutral',
          }}
        />
        <MetricCard
          title="Views This Week"
          value={data.views.week.toLocaleString()}
          icon={Eye}
          trend={{
            value: `${data.views.today} today`,
            direction: data.views.today > 0 ? 'up' : 'neutral',
          }}
        />
        <MetricCard
          title="Pending Comments"
          value={data.comments.pending}
          icon={MessageSquare}
          trend={{
            value: data.comments.pending > 0 ? 'Needs review' : 'All caught up',
            direction: data.comments.pending > 0 ? 'neutral' : 'up',
          }}
        />
        <MetricCard
          title="AI Requests Today"
          value={data.aiUsage.requestsToday}
          icon={Sparkles}
          trend={{
            value: `${(data.aiUsage.tokensToday / 1000).toFixed(1)}k tokens`,
            direction: 'neutral',
          }}
        />
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Posts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Posts This Week</h2>
            <Link href="/admin/analytics">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="p-6">
            {data.topPosts.length === 0 ? (
              <p className="text-gray-500 text-sm">No posts yet</p>
            ) : (
              <ul className="space-y-3">
                {data.topPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="flex items-center justify-between group"
                    >
                      <span className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views.toLocaleString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {data.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              <ul className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <li key={activity.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {activity.user.name || activity.user.email}
                        </span>{' '}
                        <span className="text-gray-500">
                          {activity.action.replace('_', ' ')} {activity.entity}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
          <Link href="/admin/media">
            <Button variant="outline">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Upload Media
            </Button>
          </Link>
          <Link href="/admin/comments">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Moderate Comments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
