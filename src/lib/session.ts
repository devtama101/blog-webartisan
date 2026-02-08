import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

export interface SessionUser {
  userId: string
  email: string
  name: string | null
  role: string | null
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    // Check NextAuth cookie first, fall back to legacy cookie
    const token = cookieStore.get("next-auth.session-token")?.value ||
                 cookieStore.get("session-token")?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | null,
      role: payload.role as string | null
    }
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    return null
  }

  return session
}
