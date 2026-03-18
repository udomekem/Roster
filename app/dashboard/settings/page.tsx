'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/use-user'
import { useOrganisation } from '@/hooks/use-organisation'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, PageLoading } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const { data: user, isLoading: userLoading } = useUser()
  const { data: org, isLoading: orgLoading } = useOrganisation()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  const [orgName, setOrgName] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgAddress, setOrgAddress] = useState('')
  const [orgSaving, setOrgSaving] = useState(false)
  const [orgMessage, setOrgMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.full_name)
      setPhone(user.phone ?? '')
    }
  }, [user])

  useEffect(() => {
    if (org) {
      setOrgName(org.name)
      setOrgPhone(org.phone ?? '')
      setOrgAddress(org.address ?? '')
    }
  }, [org])

  if (userLoading || orgLoading) return <PageLoading />

  const isSuperAdmin = user?.role === 'super_admin'

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setProfileSaving(true)
    setProfileMessage('')

    const { error } = await supabase
      .from('staff_profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq('id', user.id)

    setProfileSaving(false)
    if (error) {
      setProfileMessage('Failed to update profile')
    } else {
      setProfileMessage('Profile updated')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  }

  async function handleOrgSave(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    setOrgSaving(true)
    setOrgMessage('')

    const { error } = await supabase
      .from('organisations')
      .update({
        name: orgName.trim(),
        phone: orgPhone.trim() || null,
        address: orgAddress.trim() || null,
      })
      .eq('id', org.id)

    setOrgSaving(false)
    if (error) {
      setOrgMessage('Failed to update organisation')
    } else {
      setOrgMessage('Organisation updated')
      queryClient.invalidateQueries({ queryKey: ['organisation'] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile and organisation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="max-w-md space-y-4">
            <Input
              id="fullName"
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              value={user?.email ?? ''}
              disabled
            />
            <Input
              id="phone"
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {profileMessage && (
              <p className={`text-sm ${profileMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                {profileMessage}
              </p>
            )}
            <Button type="submit" loading={profileSaving}>Save profile</Button>
          </form>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrgSave} className="max-w-md space-y-4">
              <Input
                id="orgName"
                label="Organisation name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
              <Input
                id="orgPhone"
                label="Phone"
                type="tel"
                value={orgPhone}
                onChange={(e) => setOrgPhone(e.target.value)}
              />
              <Input
                id="orgAddress"
                label="Address"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
              />
              {orgMessage && (
                <p className={`text-sm ${orgMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {orgMessage}
                </p>
              )}
              <Button type="submit" loading={orgSaving}>Save organisation</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
