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
          content: 'You are a grammar and style editor. Fix grammar, spelling, and punctuation errors in the text. Maintain the original tone and voice. Return only the corrected text without any explanation.',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const result = response.choices[0]?.message?.content || content

    // Log AI usage
    await logAiUsage({
      userId: getDefaultUserId(),
      endpoint: 'fix-grammar',
      usage: response.usage,
      model: response.model,
    })

    return NextResponse.json({ result: { content: result } })
  } catch (error) {
    console.error('AI fix grammar error:', error)
    return NextResponse.json({ error: 'Failed to fix grammar' }, { status: 500 })
  }
}
