import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgName, abn, phone } = await request.json()

  if (!orgName || typeof orgName !== 'string' || orgName.trim().length < 2) {
    return NextResponse.json({ error: 'Organisation name is required' }, { status: 400 })
  }

  const serviceClient = await createServiceClient()

  const { data: existingProfile } = await serviceClient
    .from('staff_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    return NextResponse.json({ error: 'You already belong to an organisation' }, { status: 400 })
  }

  const slug = slugify(orgName) + '-' + Date.now().toString(36)

  const { data: org, error: orgError } = await serviceClient
    .from('organisations')
    .insert({
      name: orgName.trim(),
      slug,
      abn: abn?.trim() || null,
      phone: phone?.trim() || null,
      email: user.email,
    })
    .select()
    .single()

  if (orgError || !org) {
    return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 })
  }

  const orgData = org as { id: string }
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin'

  const { error: profileError } = await serviceClient
    .from('staff_profiles')
    .insert({
      id: user.id,
      organisation_id: orgData.id,
      email: user.email!,
      full_name: fullName,
      role: 'super_admin',
    })

  if (profileError) {
    await serviceClient.from('organisations').delete().eq('id', orgData.id)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }

  return NextResponse.json({ organisation: org })
}
