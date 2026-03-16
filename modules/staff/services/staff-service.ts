import { createClient } from '@/lib/supabase/client'
import type { Tables, UpdateTables } from '@/types'

export async function getStaff(): Promise<Tables<'staff_profiles'>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .order('full_name')

  if (error) throw error
  return data
}

export async function getStaffMember(id: string): Promise<Tables<'staff_profiles'>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateStaffMember(id: string, updates: UpdateTables<'staff_profiles'>): Promise<Tables<'staff_profiles'>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('staff_profiles')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function inviteStaffMember(data: {
  email: string
  fullName: string
  role: string
  phone?: string
}) {
  const res = await fetch('/api/staff/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error || 'Failed to invite staff member')
  }

  return res.json()
}
