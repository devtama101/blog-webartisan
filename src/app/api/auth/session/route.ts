import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch {
    return null
  }
}

export async function GET() {
  const cookieStore = await cookies()
  // Check NextAuth cookie first, fall back to legacy cookie
  const token = cookieStore.get("next-auth.session-token")?.value ||
               cookieStore.get("session-token")?.value

  if (!token) {
    return NextResponse.json({ user: null })
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.json({ user: null })
  }

  // Return user data
  return NextResponse.json({
    user: {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      image: null,
      role: payload.role
    }
  })
}
