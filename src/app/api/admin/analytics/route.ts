import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Views over time
    const viewsOverTime = await db.postStats.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        views: true,
        visitors: true,
      },
    })

    // Aggregate by date for cleaner data
    const viewsByDate = new Map<string, { views: number; visitors: number }>()
    viewsOverTime.forEach((stat) => {
      const dateKey = stat.date.toISOString().split('T')[0]
      const existing = viewsByDate.get(dateKey) || { views: 0, visitors: 0 }
      viewsByDate.set(dateKey, {
        views: existing.views + stat.views,
        visitors: existing.visitors + stat.visitors,
      })
    })

    const chartData = Array.from(viewsByDate.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Top posts
    const topPosts = await db.post.findMany({
      where: { status: 'PUBLISHED' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        stats: {
          where: { date: { gte: startDate } },
        },
      },
    })

    const topPostsWithViews = topPosts
      .map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.stats.reduce((sum, stat) => sum + stat.views, 0),
        visitors: post.stats.reduce((sum, stat) => sum + stat.visitors, 0),
      }))
      .sort((a, b) => b.views - a.views)

    // AI usage trends
    const aiUsageTrends = await db.aiUsageLog.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: true,
      _sum: { totalTokens: true },
    })

    // Group AI usage by date
    const aiByDate = new Map<string, { requests: number; tokens: number }>()
    aiUsageTrends.forEach((item) => {
      const dateKey = item.createdAt.toISOString().split('T')[0]
      const existing = aiByDate.get(dateKey) || { requests: 0, tokens: 0 }
      aiByDate.set(dateKey, {
        requests: existing.requests + item._count,
        tokens: existing.tokens + (item._sum.totalTokens || 0),
      })
    })

    const aiChartData = Array.from(aiByDate.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Comment activity
    const commentsByStatus = await db.comment.groupBy({
      by: ['status'],
      _count: true,
    })

    const commentStats = {
      total: commentsByStatus.reduce((sum, item) => sum + item._count, 0),
      pending: commentsByStatus.find((item) => item.status === 'PENDING')?._count || 0,
      approved: commentsByStatus.find((item) => item.status === 'APPROVED')?._count || 0,
      spam: commentsByStatus.find((item) => item.status === 'SPAM')?._count || 0,
    }

    // Summary stats
    const totalViews = chartData.reduce((sum, item) => sum + item.views, 0)
    const totalVisitors = chartData.reduce((sum, item) => sum + item.visitors, 0)
    const avgViewsPerDay = chartData.length > 0 ? Math.round(totalViews / chartData.length) : 0

    return NextResponse.json({
      summary: {
        totalViews,
        totalVisitors,
        avgViewsPerDay,
        period: parseInt(period),
      },
      chartData,
      topPosts: topPostsWithViews,
      aiUsage: aiChartData,
      comments: commentStats,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
