import { createClient } from '@/lib/supabase/client'
import type { ShiftBroadcastWithDetails } from '@/types'
import { sendNotification } from '@/lib/notifications'
import { logAudit } from '@/lib/audit-log'

const BROADCAST_SELECT = `
  *,
  shift:shifts!shift_id(id, date, start_time, end_time, status, house:houses!house_id(id, name)),
  creator:staff_profiles!created_by(id, full_name, avatar_url),
  shift_broadcast_responses(id, status, responded_at, staff:staff_profiles!staff_id(id, full_name, avatar_url, role))
`

export async function getBroadcasts(
  filters?: { status?: string }
): Promise<ShiftBroadcastWithDetails[]> {
  const supabase = createClient()
  let query = supabase
    .from('shift_broadcasts')
    .select(BROADCAST_SELECT)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as ShiftBroadcastWithDetails[]
}

export async function getBroadcast(id: string): Promise<ShiftBroadcastWithDetails | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shift_broadcasts')
    .select(BROADCAST_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ShiftBroadcastWithDetails
}

export async function createBroadcast(data: {
  shift_id: string
  message?: string
  expires_at?: string
}) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: profile, error: profileError } = await supabase
    .from('staff_profiles')
    .select('organisation_id')
    .eq('id', user.id)
    .single()
  if (profileError || !profile) throw new Error('Profile not found')

  const insertData = {
    organisation_id: profile.organisation_id,
    shift_id: data.shift_id,
    created_by: user.id,
    message: data.message ?? null,
    expires_at: data.expires_at ?? null,
    status: 'open',
  }

  const { data: result, error } = await supabase
    .from('shift_broadcasts')
    .insert(insertData as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  logAudit({ action_type: 'create', entity_type: 'shift_broadcast', entity_id: result.id })
  return result
}

export async function respondToBroadcast(
  broadcastId: string,
  status: 'interested' | 'accepted' | 'rejected'
) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: profile, error: profileError } = await supabase
    .from('staff_profiles')
    .select('organisation_id')
    .eq('id', user.id)
    .single()
  if (profileError || !profile) throw new Error('Profile not found')

  const upsertData = {
    organisation_id: profile.organisation_id,
    broadcast_id: broadcastId,
    staff_id: user.id,
    status,
  }

  const { data: result, error } = await supabase
    .from('shift_broadcast_responses')
    .upsert(upsertData as Record<string, unknown>, {
      onConflict: 'broadcast_id,staff_id',
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateBroadcastStatus(
  id: string,
  status: 'open' | 'filled' | 'cancelled'
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shift_broadcasts')
    .update({ status } as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (status === 'filled') {
    logAudit({ action_type: 'fill', entity_type: 'shift_broadcast', entity_id: id })
  }
  if (status === 'cancelled') {
    logAudit({ action_type: 'cancel', entity_type: 'shift_broadcast', entity_id: id })
  }

  return data
}

export async function acceptBroadcastResponse(responseId: string) {
  const supabase = createClient()

  const { data: response, error: fetchError } = await supabase
    .from('shift_broadcast_responses')
    .select('broadcast_id, staff_id')
    .eq('id', responseId)
    .single()
  if (fetchError || !response) throw new Error('Response not found')

  const { data: updatedResponse, error: updateError } = await supabase
    .from('shift_broadcast_responses')
    .update({ status: 'accepted' } as Record<string, unknown>)
    .eq('id', responseId)
    .select()
    .single()
  if (updateError) throw updateError

  await supabase
    .from('shift_broadcast_responses')
    .update({ status: 'rejected' } as Record<string, unknown>)
    .eq('broadcast_id', response.broadcast_id)
    .neq('id', responseId)

  await supabase
    .from('shift_broadcasts')
    .update({ status: 'filled' } as Record<string, unknown>)
    .eq('id', response.broadcast_id)

  sendNotification({
    user_id: response.staff_id,
    title: 'Broadcast accepted',
    body: 'Your response to the shift broadcast has been accepted. Tap to view details.',
    type: 'broadcast_response',
    reference_type: 'shift_broadcast',
    reference_id: response.broadcast_id,
  })

  return updatedResponse
}
