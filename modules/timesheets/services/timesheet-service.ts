import { createClient } from '@/lib/supabase/client'
import type { InsertTables, UpdateTables } from '@/types'

function getFortnightBounds(date: Date = new Date()): { start: string; end: string } {
  const epoch = new Date('2026-01-05') // a Monday — fixed epoch for consistent fortnights
  const diff = Math.floor((date.getTime() - epoch.getTime()) / (14 * 24 * 60 * 60 * 1000))
  const start = new Date(epoch.getTime() + diff * 14 * 24 * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 13 * 24 * 60 * 60 * 1000)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export { getFortnightBounds }

export async function getMyShiftsForPeriod(periodStart: string, periodEnd: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('shift_assignments')
    .select(`
      *,
      shift:shifts!shift_id(
        id, date, start_time, end_time, status, notes,
        house:houses!house_id(id, name)
      )
    `)
    .eq('staff_id', user.id)
    .gte('shift.date', periodStart)
    .lte('shift.date', periodEnd)
    .in('status', ['accepted', 'completed'])
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).filter((a: { shift: unknown }) => a.shift !== null)
}

export async function getMySubmission(periodStart: string, periodEnd: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('shift_submissions')
    .select('*')
    .eq('staff_id', user.id)
    .eq('period_start', periodStart)
    .eq('period_end', periodEnd)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function submitFortnight(data: {
  organisation_id: string
  staff_id: string
  period_start: string
  period_end: string
  notes?: string | null
}) {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('shift_submissions')
    .upsert({
      ...data,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    } as Record<string, unknown>, { onConflict: 'staff_id,period_start,period_end' })
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getAllSubmissions(periodStart: string, periodEnd: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shift_submissions')
    .select(`
      *,
      staff:staff_profiles!staff_id(id, full_name, avatar_url, role, employment_type)
    `)
    .eq('period_start', periodStart)
    .eq('period_end', periodEnd)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function reviewSubmission(id: string, status: 'approved' | 'rejected', reviewerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shift_submissions')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getStaffHoursForPeriod(periodStart: string, periodEnd: string) {
  const supabase = createClient()

  const { data: assignments, error } = await supabase
    .from('shift_assignments')
    .select(`
      staff_id,
      status,
      shift:shifts!shift_id(id, date, start_time, end_time, status, house_id)
    `)
    .gte('shift.date', periodStart)
    .lte('shift.date', periodEnd)
    .in('status', ['accepted', 'completed'])

  if (error) throw error

  const { data: staffList, error: staffErr } = await supabase
    .from('staff_profiles')
    .select('id, full_name, avatar_url, role, employment_type, is_active')
    .eq('is_active', true)
    .order('full_name')

  if (staffErr) throw staffErr

  return { assignments: assignments ?? [], staffList: staffList ?? [] }
}
