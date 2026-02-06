'use client'

import { cn } from '@/lib/utils'

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'

const statusConfig: Record<PostStatus, { label: string; className: string }> = {
  PUBLISHED: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  DRAFT: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  },
  SCHEDULED: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
}

interface StatusBadgeProps {
  status: PostStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
