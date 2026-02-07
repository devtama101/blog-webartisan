"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface SignInButtonProps {
  variant?: "default" | "ghost" | "outline"
  className?: string
}

export function SignInButton({ variant = "default", className = "" }: SignInButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    setLoading(true)
    router.push("/login")
  }

  const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:opacity-90",
    ghost: "text-foreground hover:bg-muted",
    outline: "border hover:bg-muted"
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? "Loading..." : "Sign In"}
    </button>
  )
}
