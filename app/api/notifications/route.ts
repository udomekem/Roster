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

  const { user_id, title, body, type, reference_type, reference_id } = await request.json()

  if (!user_id || !title || !type) {
    return NextResponse.json(
      { error: 'user_id, title, and type are required' },
      { status: 400 }
    )
  }

  const serviceClient = await createServiceClient()

  const { data, error } = await serviceClient
    .from('notifications')
    .insert({
      organisation_id: profile.organisation_id,
      user_id,
      title,
      body: body || null,
      type,
      reference_type: reference_type || null,
      reference_id: reference_id || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }

  return NextResponse.json({ notification: data })
}
