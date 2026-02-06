'use client'

import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Trend = 'up' | 'down' | 'neutral'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: string
    direction: Trend
  }
  className?: string
}

export function MetricCard({ title, value, icon: Icon, trend, className }: MetricCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : trend?.direction === 'down' ? 'text-red-600' : 'text-muted-foreground'

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
          {trend && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  )
}
