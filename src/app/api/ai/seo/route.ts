import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { logAiUsage, getDefaultUserId } from '@/lib/ai-usage'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json()

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Generate SEO metadata for a blog post. Return a JSON object with "metaTitle" (50-60 chars), "metaDescription" (150-160 chars), and "tags" (array of 5-10 relevant tags). The meta title should be catchy and include keywords. The meta description should summarize the content enticingly.',
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nContent: ${content?.substring(0, 1000)}...`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const result = response.choices[0]?.message?.content || '{}'

    // Log AI usage
    await logAiUsage({
      userId: getDefaultUserId(),
      endpoint: 'seo',
      usage: response.usage,
      model: response.model,
    })

    return NextResponse.json({ result: JSON.parse(result) })
  } catch (error) {
    console.error('AI SEO error:', error)
    return NextResponse.json({ error: 'Failed to generate SEO' }, { status: 500 })
  }
}
