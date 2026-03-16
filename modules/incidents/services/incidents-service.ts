import { createClient } from '@/lib/supabase/client'
import type { InsertTables, UpdateTables } from '@/types'

export async function getIncidents(filters?: { status?: string; severity?: string }) {
  const supabase = createClient()
  let query = supabase
    .from('incidents')
    .select(`
      *,
      house:houses(id, name),
      participant:participants(id, full_name),
      reporter:staff_profiles!reported_by(id, full_name, avatar_url),
      reviewer:staff_profiles!reviewed_by(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.severity) query = query.eq('severity', filters.severity)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getIncident(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      house:houses(id, name),
      participant:participants(id, full_name),
      reporter:staff_profiles!reported_by(id, full_name, avatar_url, email),
      reviewer:staff_profiles!reviewed_by(id, full_name),
      incident_attachments(id, file_name, file_path, file_type, file_size)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createIncident(incident: InsertTables<'incidents'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('incidents')
    .insert(incident as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateIncident(id: string, updates: UpdateTables<'incidents'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('incidents')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
