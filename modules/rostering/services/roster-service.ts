import { createClient } from '@/lib/supabase/client'
import type { InsertTables, UpdateTables } from '@/types'

export async function getShifts(filters?: { houseId?: string; status?: string; dateFrom?: string; dateTo?: string }) {
  const supabase = createClient()
  let query = supabase
    .from('shifts')
    .select(`
      *,
      house:houses(id, name),
      shift_assignments(
        id, status, responded_at,
        staff:staff_profiles!staff_id(id, full_name, avatar_url, role)
      )
    `)
    .order('start_time', { ascending: true })

  if (filters?.houseId) query = query.eq('house_id', filters.houseId)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
  if (filters?.dateTo) query = query.lte('date', filters.dateTo)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getShift(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      *,
      house:houses(id, name),
      shift_assignments(
        id, status, responded_at, assigned_by,
        staff:staff_profiles!staff_id(id, full_name, avatar_url, email, phone, role)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createShift(shift: InsertTables<'shifts'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shifts')
    .insert(shift as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateShift(id: string, updates: UpdateTables<'shifts'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shifts')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteShift(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('shifts').delete().eq('id', id)
  if (error) throw error
}

export async function assignStaff(data: InsertTables<'shift_assignments'>) {
  const supabase = createClient()
  const { data: assignment, error } = await supabase
    .from('shift_assignments')
    .insert(data as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return assignment
}

export async function respondToAssignment(id: string, status: 'accepted' | 'declined') {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shift_assignments')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeAssignment(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('shift_assignments').delete().eq('id', id)
  if (error) throw error
}

export async function getMyAssignments() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shift_assignments')
    .select(`
      *,
      shift:shifts(
        id, date, start_time, end_time, status, notes,
        house:houses(id, name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
