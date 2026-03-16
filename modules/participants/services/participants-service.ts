import { createClient } from '@/lib/supabase/client'
import type { InsertTables, UpdateTables } from '@/types'

export async function getParticipants() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('participants')
    .select('*, house:houses(id, name)')
    .order('full_name')

  if (error) throw error
  return data
}

export async function getParticipant(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('participants')
    .select('*, house:houses(id, name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createParticipant(participant: InsertTables<'participants'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('participants')
    .insert(participant as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateParticipant(id: string, updates: UpdateTables<'participants'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('participants')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
