"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

interface UserMenuProps {
  variant?: "blog" | "admin"
}

export function UserMenu({ variant = "blog" }: UserMenuProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session?.user) {
    return null
  }

  // Generate avatar with initials fallback
  const getAvatarUrl = (name: string | null | undefined, img: string | null | undefined) => {
    if (img) return img
    const initials = name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
    return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=3b82f6&textColor=ffffff`
  }

  const avatarUrl = getAvatarUrl(session.user.name, session.user.image)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img
          src={avatarUrl}
          alt={session.user.name || "User"}
          className="w-8 h-8 rounded-full border border-muted"
        />
        {variant === "blog" && (
          <span className="text-sm font-medium hidden sm:inline">
            {session.user.name || "User"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg py-2 z-50">
          {/* User Info with Avatar */}
          <div className="px-4 py-3 border-b flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={session.user.name || "User"}
              className="w-10 h-10 rounded-full border border-muted"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>

          {/* Menu Items */}
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>

          {session.user.role === "ADMIN" && variant === "blog" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </Link>
          )}

          <div className="border-t my-1"></div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3-3m-3 3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
