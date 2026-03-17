import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion } from '@/lib/ai/client'

const CASE_NOTE_CATEGORIES = ['general', 'health', 'behaviour', 'medication', 'activity', 'other'] as const

interface StructuredCaseNote {
  title: string
  category: (typeof CASE_NOTE_CATEGORIES)[number]
  content: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const transcript = body?.transcript as string | undefined
    const participant_name = body?.participant_name as string | undefined

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'transcript is required and must be a string' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an NDIS case note assistant. Extract a structured case note from a voice transcript.

Output valid JSON only, with these exact fields:
- title: A short, descriptive title (string)
- category: One of: general, health, behaviour, medication, activity, other
- content: The formatted note text, properly structured and professional (string)

Do not include any text before or after the JSON. Output only the JSON object.`

    const userPrompt = participant_name
      ? `Extract a structured case note from this voice transcript. Participant: ${participant_name}\n\nTranscript:\n${transcript}`
      : `Extract a structured case note from this voice transcript:\n\n${transcript}`

    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.2, maxTokens: 1024 }
    )

    const trimmed = response.trim()
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : trimmed

    let parsed: StructuredCaseNote
    try {
      parsed = JSON.parse(jsonStr) as StructuredCaseNote
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      )
    }

    if (!parsed.title || !parsed.content) {
      return NextResponse.json(
        { error: 'AI response missing required fields (title, content)' },
        { status: 500 }
      )
    }

    const category = CASE_NOTE_CATEGORIES.includes(parsed.category as (typeof CASE_NOTE_CATEGORIES)[number])
      ? parsed.category
      : 'general'

    return NextResponse.json({
      title: parsed.title,
      category,
      content: parsed.content,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
