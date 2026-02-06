import { NextResponse } from 'next/server'
import { prisma } from '@/db'

// Groq free tier pricing (as of 2025)
const PRICING = {
  'llama-3.3-70b-versatile': {
    input: 0.59 / 1_000_000,  // $0.59 per million input tokens
    output: 0.79 / 1_000_000, // $0.79 per million output tokens
  },
  'llama-3.1-70b-versatile': {
    input: 0.59 / 1_000_000,
    output: 0.79 / 1_000_000,
  },
  default: {
    input: 0.59 / 1_000_000,
    output: 0.79 / 1_000_000,
  },
}

const LIMITS = {
  requestsPerDay: 144,     // Free tier rate limit
  tokensPerDay: 500_000,   // Free tier daily limit
  requestsPerMonth: 4_320, // 144 * 30
  tokensPerMonth: 15_000_000, // 500k * 30
}

export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)

    // Get today's usage
    const todayUsage = await prisma.aiUsageLog.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
      _count: true,
    })

    // Get this week's usage
    const weekUsage = await prisma.aiUsageLog.aggregate({
      where: {
        createdAt: { gte: weekAgo },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
      _count: true,
    })

    // Get this month's usage
    const monthUsage = await prisma.aiUsageLog.aggregate({
      where: {
        createdAt: { gte: monthAgo },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
      _count: true,
    })

    // Get usage by endpoint (today)
    const usageByEndpoint = await prisma.aiUsageLog.groupBy({
      by: ['endpoint'],
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
      _count: true,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
    })

    // Get usage by model
    const usageByModel = await prisma.aiUsageLog.groupBy({
      by: ['model'],
      where: {
        createdAt: { gte: monthAgo },
      },
      _count: true,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
    })

    // Get daily usage for the last 30 days
    const dailyUsage: Array<{ date: string; requests: number; tokens: number; inputTokens: number; outputTokens: number }> = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateEnd = new Date(date)
      dateEnd.setDate(dateEnd.getDate() + 1)

      const dayData = await prisma.aiUsageLog.aggregate({
        where: {
          createdAt: { gte: date, lt: dateEnd },
        },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
        },
        _count: true,
      })

      dailyUsage.push({
        date: date.toISOString().split('T')[0],
        requests: dayData._count || 0,
        tokens: dayData._sum.totalTokens || (dayData._sum.inputTokens || 0) + (dayData._sum.outputTokens || 0),
        inputTokens: dayData._sum.inputTokens || 0,
        outputTokens: dayData._sum.outputTokens || 0,
      })
    }

    // Get recent activity
    const recentActivity = await prisma.aiUsageLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        endpoint: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        cost: true,
        createdAt: true,
      },
    })

    // Calculate totals
    // Use totalTokens if available (already includes input + output), otherwise sum them
    const todayTokens = todayUsage._sum.totalTokens ||
                       (todayUsage._sum.inputTokens || 0) + (todayUsage._sum.outputTokens || 0)

    const weekTokens = weekUsage._sum.totalTokens ||
                      (weekUsage._sum.inputTokens || 0) + (weekUsage._sum.outputTokens || 0)

    const monthTokens = monthUsage._sum.totalTokens ||
                       (monthUsage._sum.inputTokens || 0) + (monthUsage._sum.outputTokens || 0)

    // Calculate costs
    const calculateCost = (inputTokens: number, outputTokens: number, model: string | null) => {
      const pricing = PRICING[model as keyof typeof PRICING] || PRICING.default
      return (inputTokens * pricing.input) + (outputTokens * pricing.output)
    }

    const todayCost = calculateCost(
      todayUsage._sum.inputTokens || 0,
      todayUsage._sum.outputTokens || 0,
      null
    )

    const monthCost = usageByModel.reduce((total, item) => {
      return total + calculateCost(
        item._sum.inputTokens || 0,
        item._sum.outputTokens || 0,
        item.model
      )
    }, 0)

    // Get most used model
    const mostUsedModel = usageByModel.reduce((max, item) => {
      const itemTokens = item._sum.totalTokens || (item._sum.inputTokens || 0) + (item._sum.outputTokens || 0)
      const maxTokens = max?._sum.totalTokens || (max?._sum.inputTokens || 0) + (max?._sum.outputTokens || 0)
      return itemTokens > maxTokens ? item : max
    }, usageByModel[0])

    return NextResponse.json({
      today: {
        requests: todayUsage._count || 0,
        tokens: todayTokens,
        inputTokens: todayUsage._sum.inputTokens || 0,
        outputTokens: todayUsage._sum.outputTokens || 0,
        cost: todayCost,
        avgTokensPerRequest: todayUsage._count ? Math.round(todayTokens / todayUsage._count) : 0,
      },
      week: {
        requests: weekUsage._count || 0,
        tokens: weekTokens,
      },
      month: {
        requests: monthUsage._count || 0,
        tokens: monthTokens,
        cost: monthCost,
      },
      limits: {
        requestsPerDay: LIMITS.requestsPerDay,
        tokensPerDay: LIMITS.tokensPerDay,
        requestsPerMonth: LIMITS.requestsPerMonth,
        tokensPerMonth: LIMITS.tokensPerMonth,
      },
      remaining: {
        requestsToday: Math.max(0, LIMITS.requestsPerDay - (todayUsage._count || 0)),
        tokensToday: Math.max(0, LIMITS.tokensPerDay - todayTokens),
        requestsMonth: Math.max(0, LIMITS.requestsPerMonth - (monthUsage._count || 0)),
        tokensMonth: Math.max(0, LIMITS.tokensPerMonth - monthTokens),
      },
      usageByEndpoint: usageByEndpoint.reduce((acc, item) => {
        acc[item.endpoint] = {
          count: item._count,
          tokens: item._sum.totalTokens || (item._sum.inputTokens || 0) + (item._sum.outputTokens || 0),
          inputTokens: item._sum.inputTokens || 0,
          outputTokens: item._sum.outputTokens || 0,
        }
        return acc
      }, {} as Record<string, { count: number; tokens: number; inputTokens: number; outputTokens: number }>),
      usageByModel: usageByModel.map(item => ({
        model: item.model || 'unknown',
        requests: item._count,
        tokens: item._sum.totalTokens || (item._sum.inputTokens || 0) + (item._sum.outputTokens || 0),
        inputTokens: item._sum.inputTokens || 0,
        outputTokens: item._sum.outputTokens || 0,
      })),
      mostUsedModel: mostUsedModel ? {
        model: mostUsedModel.model || 'unknown',
        tokens: (mostUsedModel._sum.totalTokens || 0) + (mostUsedModel._sum.inputTokens || 0) + (mostUsedModel._sum.outputTokens || 0),
      } : null,
      dailyUsage,
      recentActivity: recentActivity.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      endpoints: [
        { id: 'continue', name: 'Continue Writing', icon: '✍️', description: 'AI continues your content from where you left off' },
        { id: 'fix-grammar', name: 'Fix Grammar', icon: '🔧', description: 'Corrects grammar and spelling errors' },
        { id: 'rewrite', name: 'Rewrite Tone', icon: '🔄', description: 'Rewrites content in different tones' },
        { id: 'seo', name: 'Generate SEO', icon: '📈', description: 'Generates SEO metadata for your posts' },
        { id: 'summarize', name: 'Generate Excerpt', icon: '✂️', description: 'Creates a concise excerpt from your content' },
      ],
      pricing: {
        inputCostPerMillion: PRICING.default.input * 1_000_000,
        outputCostPerMillion: PRICING.default.output * 1_000_000,
      },
    })
  } catch (error) {
    console.error('Failed to fetch AI usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI usage' },
      { status: 500 }
    )
  }
}
