import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { logAiUsage, getDefaultUserId } from '@/lib/ai-usage'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json()

    if (!content && !title) {
      return NextResponse.json({ error: 'Content or title is required' }, { status: 400 })
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Generate a concise, engaging excerpt for a blog post. The excerpt should be 1-2 sentences (max 200 characters) that captures the main point and entices readers to continue reading. Avoid generic phrases like "In this article." Return only the excerpt text, no quotes or additional formatting.',
        },
        {
          role: 'user',
          content: `Title: ${title || 'Untitled'}\n\nContent: ${(content || '').substring(0, 2000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    })

    const excerpt = response.choices[0]?.message?.content?.trim() || ''

    // Clean up any quotes the AI might have added
    const cleanedExcerpt = excerpt.replace(/^["']|["']$/g, '')

    // Log AI usage
    await logAiUsage({
      userId: getDefaultUserId(),
      endpoint: 'summarize',
      usage: response.usage,
      model: response.model,
    })

    return NextResponse.json({ excerpt: cleanedExcerpt })
  } catch (error) {
    console.error('AI summarize error:', error)
    return NextResponse.json({ error: 'Failed to generate excerpt' }, { status: 500 })
  }
}
