import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch {
    return null
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect to login if accessing admin routes without auth
  if (pathname.startsWith("/admin")) {
    const cookieStore = await cookies()
    // Check NextAuth cookie first, fall back to legacy cookie
    const token = cookieStore.get("next-auth.session-token")?.value ||
                 cookieStore.get("session-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const payload = await verifyToken(token)

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"]
}
