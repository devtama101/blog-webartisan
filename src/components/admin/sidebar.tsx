'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Folder,
  Tag,
  X,
  Cpu,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  onClose?: () => void
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/ai-usage', label: 'AI Usage', icon: Cpu },
  { href: '/admin/categories', label: 'Categories', icon: Folder },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-white">WebArtisan</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-white hover:bg-gray-800">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Site
        </Link>
      </div>
    </div>
  )
}
