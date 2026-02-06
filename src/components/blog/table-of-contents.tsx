'use client'

import { useEffect, useState } from 'react'
import { TocItem } from '@/lib/toc-generator'
import { cn } from '@/lib/utils'

interface TableOfContentsProps {
  toc: TocItem[]
  activeId?: string
  variant?: 'desktop' | 'mobile'
}

export function TableOfContents({ toc, activeId, variant = 'mobile' }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentActiveId, setCurrentActiveId] = useState<string>('')

  const isDesktop = variant === 'desktop'

  // Skip IntersectionObserver for desktop variant
  useEffect(() => {
    if (isDesktop) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setCurrentActiveId(id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    document.querySelectorAll('h2, h3').forEach((heading) => {
      observer.observe(heading)
    })

    return () => observer.disconnect()
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    setCurrentActiveId(id)
    // Only close drawer for mobile variant
    if (!isDesktop) {
      setIsOpen(false)
    }
  }

  const renderItems = (items: TocItem[], level = 0) => {
    return items.map((item) => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={(e) => handleClick(e, item.id)}
          className={cn(
            'block py-2 px-3 text-sm rounded-md transition-all duration-200',
            'hover:bg-accent hover:text-accent-foreground',
            (activeId || currentActiveId) === item.id
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground',
            level > 0 && 'ml-3 text-xs'
          )}
        >
          {item.text}
        </a>
        {item.children && item.children.length > 0 && (
          <ul className="mt-1">{renderItems(item.children, level + 1)}</ul>
        )}
      </li>
    ))
  }

  if (toc.length === 0) return null

  // Desktop variant - just render the list
  if (isDesktop) {
    return (
      <ul className="space-y-1">
        {renderItems(toc)}
      </ul>
    )
  }

  // Mobile variant - render toggle button, backdrop, and drawer (hidden on desktop)
  return (
    <>
      {/* Mobile Toggle Button - hidden on desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'lg:hidden fixed bottom-6 right-6 z-50',
          'bg-primary text-primary-foreground p-3 rounded-full shadow-lg',
          'hover:bg-primary/90 transition-colors',
          'flex items-center justify-center'
        )}
        aria-label="Toggle table of contents"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          )}
        </svg>
      </button>

      {/* Mobile Backdrop - hidden on desktop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer - completely hidden on desktop */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 right-0 h-full z-50 w-72',
          'bg-card border-l border-border',
          'transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Table of Contents</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-accent rounded-md"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav>
            <ul className="space-y-1">{renderItems(toc)}</ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
