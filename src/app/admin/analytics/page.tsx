'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/admin/metric-card'
import { Button } from '@/components/ui/button'
import { Eye, Users, TrendingUp, MessageSquare } from 'lucide-react'

interface AnalyticsData {
  summary: {
    totalViews: number
    totalVisitors: number
    avgViewsPerDay: number
    period: number
  }
  chartData: Array<{ date: string; views: number; visitors: number }>
  topPosts: Array<{
    id: string
    title: string
    slug: string
    views: number
    visitors: number
  }>
  comments: {
    total: number
    pending: number
    approved: number
    spam: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Failed to load analytics</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Track your blog performance and engagement
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p} days
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={data.summary.totalViews.toLocaleString()}
          icon={Eye}
        />
        <MetricCard
          title="Total Visitors"
          value={data.summary.totalVisitors.toLocaleString()}
          icon={Users}
        />
        <MetricCard
          title="Avg Views/Day"
          value={data.summary.avgViewsPerDay.toLocaleString()}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Comments"
          value={data.comments.total.toLocaleString()}
          icon={MessageSquare}
        />
      </div>

      {/* Views Chart and Top Posts Side by Side */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Views Chart - takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Views Over Time</h2>
          {data.chartData.length > 0 ? (
            <div className="h-64 flex items-end gap-3">
              {data.chartData.map((item, index) => {
                const maxViews = Math.max(...data.chartData.map((d) => d.views))
                const heightPercent = maxViews > 0 ? (item.views / maxViews) * 100 : 0
                const barHeight = Math.max((heightPercent / 100) * 220, 8) // Max 220px for bars, min 8px

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center justify-end gap-2 group"
                  >
                    <div className="relative w-full" style={{ height: '220px' }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t transition-all group-hover:bg-blue-500 flex items-end justify-center"
                        style={{ height: `${barHeight}px` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg pointer-events-none">
                          {item.views.toLocaleString()} views
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available for this period
            </div>
          )}
        </div>

        {/* Top Posts - takes 1 column */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-base font-semibold">Top Posts</h2>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {data.topPosts.length === 0 ? (
              <p className="text-gray-500 text-sm">No posts yet</p>
            ) : (
              data.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700 shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-blue-600 transition-colors block truncate text-gray-900"
                    >
                      {post.title}
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-900">{post.views.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Comment Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Comment Moderation</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{data.comments.approved}</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{data.comments.pending}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-100">
            <p className="text-sm text-gray-600">Spam</p>
            <p className="text-2xl font-bold text-red-600">{data.comments.spam}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
