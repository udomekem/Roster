import { createClient } from '@/lib/supabase/client'
import type { InsertTables, UpdateTables } from '@/types'

export async function getAvailability(filters?: {
  staffId?: string
  dateFrom?: string
  dateTo?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('staff_availability')
    .select('*')
    .order('date', { ascending: true })

  if (filters?.staffId) query = query.eq('staff_id', filters.staffId)
  if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
  if (filters?.dateTo) query = query.lte('date', filters.dateTo)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMyAvailability(dateFrom?: string, dateTo?: string) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('staff_availability')
    .select('*')
    .eq('staff_id', user.id)
    .order('date', { ascending: true })

  if (dateFrom) query = query.gte('date', dateFrom)
  if (dateTo) query = query.lte('date', dateTo)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function setAvailability(data: InsertTables<'staff_availability'>) {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('staff_availability')
    .upsert(data as Record<string, unknown>, { onConflict: 'staff_id,date' })
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateAvailability(
  id: string,
  updates: UpdateTables<'staff_availability'>
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('staff_availability')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAvailability(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('staff_availability').delete().eq('id', id)
  if (error) throw error
}

export async function getAvailableStaffForDate(date: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('staff_availability')
    .select(
      '*, staff:staff_profiles!staff_id(id, full_name, avatar_url, role, phone, email)'
    )
    .eq('date', date)
    .eq('is_available', true)

  if (error) throw error
  return data
}

export async function bulkSetAvailability(
  entries: InsertTables<'staff_availability'>[]
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('staff_availability')
    .upsert(entries as Record<string, unknown>[], {
      onConflict: 'staff_id,date',
    })
    .select()

  if (error) throw error
  return data
}
