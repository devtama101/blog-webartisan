import { NextResponse } from "next/server"
import { prisma } from "@/db"
import { requireAdmin } from "@/lib/session"

// GET /api/admin/settings - Get site settings
export async function GET() {
  try {
    const session = await requireAdmin()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create settings
    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {}
      })
    }

    return NextResponse.json({
      blogName: settings.blogName,
      blogTitle: settings.blogTitle,
      blogDescription: settings.blogDescription
    })
  } catch (error) {
    console.error("[SETTINGS] Error fetching:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update site settings
export async function PUT(req: Request) {
  try {
    const session = await requireAdmin()

    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { blogName, blogTitle, blogDescription } = body

    // Validate
    if (blogName && typeof blogName !== "string") {
      return NextResponse.json({ error: "Invalid blog name" }, { status: 400 })
    }
    if (blogTitle && typeof blogTitle !== "string") {
      return NextResponse.json({ error: "Invalid blog title" }, { status: 400 })
    }
    if (blogDescription && typeof blogDescription !== "string") {
      return NextResponse.json({ error: "Invalid blog description" }, { status: 400 })
    }

    // Get or create settings
    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          blogName: blogName ?? undefined,
          blogTitle: blogTitle ?? undefined,
          blogDescription: blogDescription ?? undefined
        }
      })
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          ...(blogName !== undefined && { blogName }),
          ...(blogTitle !== undefined && { blogTitle }),
          ...(blogDescription !== undefined && { blogDescription })
        }
      })
    }

    return NextResponse.json({
      blogName: settings.blogName,
      blogTitle: settings.blogTitle,
      blogDescription: settings.blogDescription
    })
  } catch (error) {
    console.error("[SETTINGS] Error updating:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
