import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Post counts by status
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      archivedPosts,
    ] = await Promise.all([
      db.post.count(),
      db.post.count({ where: { status: 'PUBLISHED' } }),
      db.post.count({ where: { status: 'DRAFT' } }),
      db.post.count({ where: { status: 'SCHEDULED' } }),
      db.post.count({ where: { status: 'ARCHIVED' } }),
    ])

    // Views stats (from PostStats)
    const [viewsToday, viewsWeek, viewsMonth] = await Promise.all([
      db.postStats.aggregate({
        where: { date: { gte: today } },
        _sum: { views: true },
      }),
      db.postStats.aggregate({
        where: { date: { gte: weekAgo } },
        _sum: { views: true },
      }),
      db.postStats.aggregate({
        where: { date: { gte: monthAgo } },
        _sum: { views: true },
      }),
    ])

    // Pending comments
    const pendingComments = await db.comment.count({
      where: { status: 'PENDING' },
    })

    // AI usage today
    const aiUsageToday = await db.aiUsageLog.aggregate({
      where: { createdAt: { gte: today } },
      _count: true,
      _sum: { totalTokens: true },
    })

    // Top posts this week
    const topPosts = await db.post.findMany({
      where: { status: 'PUBLISHED' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        stats: {
          where: { date: { gte: weekAgo } },
        },
      },
    })

    // Calculate views for each post
    const topPostsWithViews = topPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      views: post.stats.reduce((sum, stat) => sum + stat.views, 0),
    })).sort((a, b) => b.views - a.views)

    // Recent activity
    const recentActivity = await db.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json({
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        scheduled: scheduledPosts,
        archived: archivedPosts,
      },
      views: {
        today: viewsToday._sum.views || 0,
        week: viewsWeek._sum.views || 0,
        month: viewsMonth._sum.views || 0,
      },
      comments: {
        pending: pendingComments,
      },
      aiUsage: {
        requestsToday: aiUsageToday._count,
        tokensToday: aiUsageToday._sum.totalTokens || 0,
      },
      topPosts: topPostsWithViews,
      recentActivity,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
