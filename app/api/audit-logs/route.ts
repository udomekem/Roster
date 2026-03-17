import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the caller's org
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('organisation_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
  }

  const { action_type, entity_type, entity_id, metadata } = await request.json()

  if (!action_type || !entity_type || !entity_id) {
    return NextResponse.json(
      { error: 'action_type, entity_type, and entity_id are required' },
      { status: 400 }
    )
  }

  const serviceClient = await createServiceClient()

  const { error } = await serviceClient
    .from('audit_logs')
    .insert({
      organisation_id: profile.organisation_id,
      user_id: user.id,
      action_type,
      entity_type,
      entity_id,
      metadata: metadata || null,
    })

  if (error) {
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
