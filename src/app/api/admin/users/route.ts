import { NextResponse } from "next/server"
import { prisma } from "@/db"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"

// GET - List all users (admin only)
export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ users })
}

// POST - Create new user (admin only)
export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { email, password, name, role } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      role: role || "USER"
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true
    }
  })

  return NextResponse.json({ user }, { status: 201 })
}
