import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { chatCompletion } from '@/lib/ai/client'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const shift_id = body?.shift_id as string | undefined

    if (!shift_id) {
      return NextResponse.json(
        { error: 'shift_id is required' },
        { status: 400 }
      )
    }

    const serviceClient = await createServiceClient()

    const { data: shift, error: shiftError } = await serviceClient
      .from('shifts')
      .select(`
        id,
        date,
        start_time,
        end_time,
        status,
        notes,
        organisation_id,
        house_id,
        house:houses(id, name),
        shift_assignments(
          id,
          status,
          staff:staff_profiles!staff_id(id, full_name, avatar_url, role)
        )
      `)
      .eq('id', shift_id)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    const houseArr = shift.house as unknown as { id: string; name: string }[] | null
    const house = houseArr?.[0] ?? null
    const houseId = house?.id ?? shift.house_id

    const { data: caseNotes } = await serviceClient
      .from('case_notes')
      .select('id, content, category, created_at, participant:participants(full_name)')
      .or(`shift_id.eq.${shift_id}${houseId ? `,and(house_id.eq.${houseId},created_at.gte.${shift.date}T00:00:00,created_at.lte.${shift.date}T23:59:59)` : ''}`)

    const assignments = shift.shift_assignments as unknown as {
      id: string; status: string; staff: { full_name: string; role: string }[]
    }[]
    const notes = caseNotes as unknown as {
      content: string; category: string | null; participant: { full_name: string }[]
    }[] | null

    const shiftData = {
      shift: {
        id: shift.id,
        date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: shift.status,
        notes: shift.notes,
        house: house?.name ?? 'Unknown',
      },
      assignments: (assignments || []).map((a) => ({
        staff_name: a.staff?.[0]?.full_name ?? 'Unknown',
        role: a.staff?.[0]?.role ?? 'staff',
      })),
      case_notes: (notes || []).map((n) => ({
        content: n.content,
        category: n.category,
        participant: n.participant?.[0]?.full_name,
      })),
    }

    const systemPrompt = `You are an NDIS care coordinator. Summarise shift information clearly and concisely for handover and records. Focus on who worked, where, the time range, and key highlights from case notes.`
    const userPrompt = `Summarise this shift:\n\n${JSON.stringify(shiftData, null, 2)}`

    const summary = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    const { error: insertError } = await serviceClient
      .from('shift_summaries')
      .insert({
        organisation_id: shift.organisation_id,
        shift_id: shift.id,
        summary,
        generated_by: user.id,
      })

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save summary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
