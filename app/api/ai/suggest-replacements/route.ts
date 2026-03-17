import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface ReplacementSuggestion {
  staff_id: string
  full_name: string
  avatar_url: string | null
  role: string
  familiarity_score: number
  is_available: boolean
  reason: string
}

function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const shift_id = body?.shift_id as string | undefined
    const date = body?.date as string | undefined

    if (!shift_id || !date) {
      return NextResponse.json(
        { error: 'shift_id and date are required' },
        { status: 400 }
      )
    }

    const serviceClient = await createServiceClient()

    const { data: shift, error: shiftError } = await serviceClient
      .from('shifts')
      .select('id, house_id, start_time, end_time, organisation_id')
      .eq('id', shift_id)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    const { data: availableStaff } = await serviceClient
      .from('staff_availability')
      .select('staff_id, staff:staff_profiles!staff_id(id, full_name, avatar_url, role)')
      .eq('organisation_id', shift.organisation_id)
      .eq('date', date)
      .eq('is_available', true)

    type AvailRow = {
      staff_id: string
      staff: { id: string; full_name: string; avatar_url: string | null; role: string }[]
    }
    const rows = availableStaff as unknown as AvailRow[] | null

    const staffIds = (rows || [])
      .map((a) => a.staff_id)
      .filter(Boolean)

    if (staffIds.length === 0) {
      return NextResponse.json([] as ReplacementSuggestion[])
    }

    const { data: shiftsOnDate } = await serviceClient
      .from('shifts')
      .select('id, start_time, end_time')
      .eq('organisation_id', shift.organisation_id)
      .eq('date', date)

    const overlappingShiftIds = (shiftsOnDate || [])
      .filter(
        (s: { id: string; start_time: string; end_time: string }) =>
          s.id !== shift_id &&
          timeRangesOverlap(shift.start_time, shift.end_time, s.start_time, s.end_time)
      )
      .map((s: { id: string }) => s.id)

    let busyStaffIds = new Set<string>()
    if (overlappingShiftIds.length > 0) {
      const { data: overlappingAssignments } = await serviceClient
        .from('shift_assignments')
        .select('staff_id')
        .in('shift_id', overlappingShiftIds)
        .in('staff_id', staffIds)

      busyStaffIds = new Set(
        (overlappingAssignments || []).map((a: { staff_id: string }) => a.staff_id)
      )
    }

    const { data: pastShiftsForHouse } = await serviceClient
      .from('shifts')
      .select('id')
      .eq('house_id', shift.house_id)
      .neq('id', shift_id)

    const houseShiftIds = (pastShiftsForHouse || []).map((s: { id: string }) => s.id)

    let familiarityMap = new Map<string, number>()
    if (houseShiftIds.length > 0) {
      const { data: houseAssignments } = await serviceClient
        .from('shift_assignments')
        .select('staff_id')
        .in('shift_id', houseShiftIds)

      for (const a of houseAssignments || []) {
        const id = (a as { staff_id: string }).staff_id
        familiarityMap.set(id, (familiarityMap.get(id) ?? 0) + 1)
      }
    }

    const suggestions: ReplacementSuggestion[] = (rows || []).map((a) => {
      const staff = a.staff?.[0]
      const isAvailable = !busyStaffIds.has(a.staff_id)
      const familiarity_score = familiarityMap.get(a.staff_id) ?? 0
      const reason = isAvailable
        ? familiarity_score > 0
          ? `Worked at this house ${familiarity_score} time(s) before`
          : 'Available'
        : 'Already assigned to overlapping shift'

      return {
        staff_id: a.staff_id,
        full_name: staff?.full_name ?? 'Unknown',
        avatar_url: staff?.avatar_url ?? null,
        role: staff?.role ?? 'staff',
        familiarity_score,
        is_available: isAvailable,
        reason,
      }
    })

    suggestions.sort((a, b) => {
      if (a.is_available !== b.is_available) return a.is_available ? -1 : 1
      return b.familiarity_score - a.familiarity_score
    })

    return NextResponse.json(suggestions)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
