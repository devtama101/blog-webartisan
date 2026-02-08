import { NextResponse } from "next/server"
import { prisma } from "@/db"
import { unstable_cache } from "next/cache"

// Cache settings for 1 hour
const getSettings = unstable_cache(
  async () => {
    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {}
      })
    }

    return {
      blogName: settings.blogName,
      blogTitle: settings.blogTitle,
      blogDescription: settings.blogDescription
    }
  },
  ["site-settings"],
  { revalidate: 3600 }
)

// GET /api/b/settings - Get public site settings
export async function GET() {
  try {
    const settings = await getSettings()

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[SETTINGS] Error fetching:", error)
    // Return defaults on error
    return NextResponse.json({
      blogName: "WebArtisan Blog",
      blogTitle: "Tools & Craft",
      blogDescription: "Thoughts on development, design, and the future of the web."
    })
  }
}
