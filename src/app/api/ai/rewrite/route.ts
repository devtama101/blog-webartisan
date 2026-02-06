import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { logAiUsage, getDefaultUserId } from '@/lib/ai-usage'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

const toneInstructions = {
  casual: 'Rewrite this in a casual, conversational tone. Use simple language and a friendly voice.',
  professional: 'Rewrite this in a professional, formal tone. Use sophisticated language and a business-appropriate voice.',
  concise: 'Rewrite this to be more concise. Remove unnecessary words and get straight to the point while maintaining meaning.',
}

export async function POST(req: NextRequest) {
  try {
    const { content, tone } = await req.json()

    const instruction = toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a blog writing assistant. ${instruction} Return only the rewritten text without any explanation.`,
        },
        {
          role: 'user',
          content: content,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const result = response.choices[0]?.message?.content || content

    // Log AI usage
    await logAiUsage({
      userId: getDefaultUserId(),
      endpoint: 'rewrite',
      usage: response.usage,
      model: response.model,
    })

    return NextResponse.json({ result: { content: result } })
  } catch (error) {
    console.error('AI rewrite error:', error)
    return NextResponse.json({ error: 'Failed to rewrite content' }, { status: 500 })
  }
}
