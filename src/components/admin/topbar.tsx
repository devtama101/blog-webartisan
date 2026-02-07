'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'

interface TopbarProps {
  onMenuClick?: () => void
  breadcrumbs?: { label: string; href?: string }[]
  title?: string
}

export function Topbar({ onMenuClick, breadcrumbs, title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center gap-4">
        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-gray-600">
          <a href="/admin" className="hover:text-gray-900 transition-colors">
            Dashboard
          </a>
          {breadcrumbs?.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-gray-900 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Title (mobile only) */}
        {title && <h1 className="md:hidden text-lg font-semibold text-gray-900">{title}</h1>}
      </div>

      {/* Right side - User Menu */}
      <UserMenu variant="admin" />
    </header>
  )
}
