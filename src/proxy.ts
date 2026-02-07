import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Redirect to login if accessing admin routes without auth
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const url = new URL("/login", req.url)
      return NextResponse.redirect(url)
    }

    // Check for ADMIN role on admin routes
    if (session.user.role !== "ADMIN") {
      const url = new URL("/", req.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"]
}
