'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/sidebar'
import { Topbar } from '@/components/admin/topbar'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r">
        <Sidebar />
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <div className="flex h-full flex-col bg-background">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
