import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rawProfile } = await supabase
    .from('staff_profiles')
    .select('organisation_id, role')
    .eq('id', user.id)
    .single()

  const profile = rawProfile as { organisation_id: string; role: string } | null

  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, fullName, role, phone } = await request.json()

  if (!email || !fullName || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['team_leader', 'staff'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const serviceClient = await createServiceClient()

  const { data: authUser, error: inviteError } = await serviceClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 })
  }

  const { error: profileError } = await serviceClient
    .from('staff_profiles')
    .insert({
      id: authUser.user.id,
      organisation_id: profile.organisation_id,
      email,
      full_name: fullName,
      role,
      phone: phone || null,
    })

  if (profileError) {
    await serviceClient.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: 'Failed to create staff profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
