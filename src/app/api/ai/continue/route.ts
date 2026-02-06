import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { logAiUsage, getDefaultUserId } from '@/lib/ai-usage'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful blog writing assistant. Continue the blog post naturally, maintaining the same tone and style. Write 2-3 paragraphs that expand on the content.',
        },
        {
          role: 'user',
          content: `Continue this blog post:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const result = response.choices[0]?.message?.content || ''

    // Log AI usage
    await logAiUsage({
      userId: getDefaultUserId(),
      endpoint: 'continue',
      usage: response.usage,
      model: response.model,
    })

    return NextResponse.json({ result: { content: result } })
  } catch (error) {
    console.error('AI continue error:', error)
    return NextResponse.json({ error: 'Failed to continue writing' }, { status: 500 })
  }
}
