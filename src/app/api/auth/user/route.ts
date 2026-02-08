import { NextResponse } from "next/server"
import { prisma } from "@/db"
import bcrypt from "bcryptjs"
import { getSession } from "@/lib/session"

// PUT - Update current user profile
export async function PUT(req: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, currentPassword, newPassword, image } = body

  console.log('[SETTINGS UPDATE] Request:', { name, email, hasImage: !!image, userId: session.userId })

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const updateData: any = {}

  // Update name
  if (name !== undefined) {
    updateData.name = name
  }

  // Update email
  if (email !== undefined && email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }
    updateData.email = email
  }

  // Update image/avatar
  if (image !== undefined) {
    updateData.image = image
    console.log('[SETTINGS UPDATE] Updating image, length:', image?.length || 0)
  }

  // Update password
  if (newPassword) {
    if (!currentPassword || !user.password) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true
    }
  })

  console.log('[SETTINGS UPDATE] Saved user:', {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    hasImage: !!updatedUser.image,
    updateDataKeys: Object.keys(updateData)
  })

  return NextResponse.json({ success: true, user: updatedUser })
}
