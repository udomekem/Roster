import { createClient } from '@/lib/supabase/client'
import type { InsertTables, UpdateTables } from '@/types'

export async function getCaseNotes(filters?: { participantId?: string; authorId?: string }) {
  const supabase = createClient()
  let query = supabase
    .from('case_notes')
    .select(`
      *,
      participant:participants(id, full_name),
      author:staff_profiles!author_id(id, full_name, avatar_url),
      case_note_attachments(id, file_name, file_path, file_type)
    `)
    .order('created_at', { ascending: false })

  if (filters?.participantId) query = query.eq('participant_id', filters.participantId)
  if (filters?.authorId) query = query.eq('author_id', filters.authorId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getCaseNote(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('case_notes')
    .select(`
      *,
      participant:participants(id, full_name),
      author:staff_profiles!author_id(id, full_name, avatar_url, email),
      case_note_attachments(id, file_name, file_path, file_type, file_size)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCaseNote(note: InsertTables<'case_notes'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('case_notes')
    .insert(note as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCaseNote(id: string, updates: UpdateTables<'case_notes'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('case_notes')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleFlag(id: string, isFlagged: boolean) {
  return updateCaseNote(id, { is_flagged: !isFlagged })
}
