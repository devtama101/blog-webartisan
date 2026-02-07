import NextAuth from "next-auth"
import { authConfig } from "@/app/api/auth/[...nextauth]/options"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET
})

// Helper to get session server-side
export async function getSession() {
  return await auth()
}
