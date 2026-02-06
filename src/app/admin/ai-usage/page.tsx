'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/admin/metric-card'
import { Button } from '@/components/ui/button'
import { Cpu, TrendingUp, RefreshCw } from 'lucide-react'

interface AiUsageData {
  today: {
    requests: number
    tokens: number
    inputTokens: number
    outputTokens: number
    cost: number
    avgTokensPerRequest: number
  }
  week: {
    requests: number
    tokens: number
  }
  month: {
    requests: number
    tokens: number
    cost: number
  }
  limits: {
    requestsPerDay: number
    tokensPerDay: number
    requestsPerMonth: number
    tokensPerMonth: number
  }
  remaining: {
    requestsToday: number
    tokensToday: number
    requestsMonth: number
    tokensMonth: number
  }
  usageByEndpoint: Record<string, { count: number; tokens: number; inputTokens: number; outputTokens: number }>
  usageByModel: Array<{ model: string; requests: number; tokens: number; inputTokens: number; outputTokens: number }>
  mostUsedModel: { model: string; tokens: number } | null
  dailyUsage: Array<{ date: string; requests: number; tokens: number; inputTokens: number; outputTokens: number }>
  recentActivity: Array<{
    id: string
    endpoint: string
    model: string | null
    inputTokens: number | null
    outputTokens: number | null
    totalTokens: number | null
    cost: number | null
    createdAt: string
  }>
  endpoints: Array<{ id: string; name: string; icon: string; description: string }>
  pricing: {
    inputCostPerMillion: number
    outputCostPerMillion: number
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatCost = (cost: number) => {
  return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(4)}`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AiUsagePage() {
  const [data, setData] = useState<AiUsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/admin/ai-usage')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading AI usage...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Failed to load AI usage</div>
      </div>
    )
  }

  const todayRequestPercent = (data.today.requests / data.limits.requestsPerDay) * 100
  const todayTokenPercent = (data.today.tokens / data.limits.tokensPerDay) * 100
  const monthTokenPercent = (data.month.tokens / data.limits.tokensPerMonth) * 100

  // Find max for chart scaling
  const maxDailyTokens = Math.max(...data.dailyUsage.map(d => d.tokens), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Usage</h1>
          <p className="text-gray-600">Track your AI API usage and limits</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Requests Today"
          value={`${data.today.requests}/${data.limits.requestsPerDay}`}
          trend={{ value: `${data.remaining.requestsToday} remaining`, direction: 'neutral' }}
          icon={Cpu}
        />
        <MetricCard
          title="Tokens Today"
          value={`${formatNumber(data.today.tokens)}/${formatNumber(data.limits.tokensPerDay)}`}
          trend={{ value: `${formatNumber(data.remaining.tokensToday)} remaining`, direction: 'neutral' }}
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Tokens/Request"
          value={formatNumber(data.today.avgTokensPerRequest)}
          trend={{ value: "Today's average", direction: 'neutral' }}
        />
        <MetricCard
          title="Est. Cost Today"
          value={formatCost(data.today.cost)}
          trend={{ value: 'Based on Groq pricing', direction: 'neutral' }}
        />
      </div>

      {/* Limits Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Requests */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Requests</span>
              <span className="font-medium text-gray-900">
                {data.today.requests}/{data.limits.requestsPerDay}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  todayRequestPercent > 90 ? 'bg-red-500' :
                  todayRequestPercent > 70 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(todayRequestPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{data.remaining.requestsToday} requests remaining</p>
          </div>

          {/* Tokens */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Tokens</span>
              <span className="font-medium text-gray-900">
                {formatNumber(data.today.tokens)}/{formatNumber(data.limits.tokensPerDay)}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  todayTokenPercent > 90 ? 'bg-red-500' :
                  todayTokenPercent > 70 ? 'bg-yellow-500' :
                  'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(todayTokenPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatNumber(data.remaining.tokensToday)} tokens remaining</p>
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.month.requests)}</p>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.month.tokens)}</p>
            <p className="text-sm text-gray-600">Total Tokens</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.week.tokens)}</p>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatCost(data.month.cost)}</p>
            <p className="text-sm text-gray-600">Est. Cost</p>
          </div>
        </div>

        {/* Monthly Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Monthly Token Usage</span>
            <span className="font-medium text-gray-900">
              {formatNumber(data.month.tokens)}/{formatNumber(data.limits.tokensPerMonth)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                monthTokenPercent > 90 ? 'bg-red-500' :
                monthTokenPercent > 70 ? 'bg-yellow-500' :
                'bg-purple-500'
              }`}
              style={{ width: `${Math.min(monthTokenPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{formatNumber(data.remaining.tokensMonth)} tokens remaining this month</p>
        </div>
      </div>

      {/* Usage Over Time Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 30 Days</h2>
        <div className="relative h-48">
          <div className="absolute inset-0 flex items-end gap-1">
            {data.dailyUsage.map((day, index) => {
              const height = maxDailyTokens > 0 ? (day.tokens / maxDailyTokens) * 100 : 0
              const isToday = index === data.dailyUsage.length - 1
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${day.date}: ${formatNumber(day.tokens)} tokens`}
                >
                  <div className="w-full bg-gray-100 rounded-t overflow-hidden flex-1 relative min-h-[4px]">
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-t transition-all ${
                        isToday ? 'bg-blue-600' : 'bg-blue-400 group-hover:bg-blue-500'
                      }`}
                      style={{ height: `${Math.max(height, 1)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Feature */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Feature</h2>
          <div className="space-y-4">
            {data.endpoints.map((ep) => {
              const usage = data.usageByEndpoint[ep.id] || { count: 0, tokens: 0, inputTokens: 0, outputTokens: 0 }
              const maxTokens = Math.max(...Object.values(data.usageByEndpoint).map(u => u.tokens), 1)
              const barWidth = maxTokens > 0 ? (usage.tokens / maxTokens) * 100 : 0

              return (
                <div key={ep.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ep.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{ep.name}</p>
                        <p className="text-xs text-gray-500">{usage.count} requests</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(usage.tokens)} tokens</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${Math.max(barWidth, 2)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Usage by Model */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Model</h2>
          <div className="space-y-4">
            {data.usageByModel.length === 0 ? (
              <p className="text-gray-500 text-sm">No usage data available yet</p>
            ) : (
              data.usageByModel.map((model) => {
                const maxTokens = Math.max(...data.usageByModel.map(m => m.tokens), 1)
                const barWidth = (model.tokens / maxTokens) * 100
                const isMostUsed = data.mostUsedModel?.model === model.model

                return (
                  <div key={model.model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {model.model}
                          {isMostUsed && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Most Used</span>}
                        </p>
                        <p className="text-xs text-gray-500">{model.requests} requests</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatNumber(model.tokens)} tokens</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isMostUsed ? 'bg-purple-500' : 'bg-gray-400'}`}
                        style={{ width: `${Math.max(barWidth, 2)}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {data.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent AI activity</p>
          ) : (
            data.recentActivity.map((log) => {
              const endpoint = data.endpoints.find(e => e.id === log.endpoint)
              return (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{endpoint?.icon || '🤖'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{endpoint?.name || log.endpoint}</p>
                      <p className="text-xs text-gray-500">
                        {log.model || 'Unknown model'} • {formatNumber(log.totalTokens || log.inputTokens + log.outputTokens || 0)} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          Based on Groq API pricing for Llama models. Actual costs may vary.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Input:</span>
            <span className="ml-2 font-medium text-gray-900">${data.pricing.inputCostPerMillion.toFixed(2)}/M tokens</span>
          </div>
          <div>
            <span className="text-gray-600">Output:</span>
            <span className="ml-2 font-medium text-gray-900">${data.pricing.outputCostPerMillion.toFixed(2)}/M tokens</span>
          </div>
        </div>
      </div>
    </div>
  )
}
