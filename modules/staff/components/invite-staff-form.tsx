'use client'

import { useState, type FormEvent } from 'react'
import { Button, Input, Select } from '@/components/ui'
import { ROLE_LABELS, ROLES, type Role } from '@/lib/constants'

interface InviteStaffFormProps {
  onSubmit: (data: { email: string; fullName: string; role: string; phone?: string }) => void
  loading?: boolean
}

const roleOptions = [
  { value: ROLES.TEAM_LEADER, label: ROLE_LABELS[ROLES.TEAM_LEADER] },
  { value: ROLES.STAFF, label: ROLE_LABELS[ROLES.STAFF] },
]

export function InviteStaffForm({ onSubmit, loading }: InviteStaffFormProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>(ROLES.STAFF)
  const [phone, setPhone] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      email: email.trim(),
      fullName: fullName.trim(),
      role,
      phone: phone.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="fullName"
        label="Full name"
        placeholder="Jane Smith"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <Input
        id="email"
        label="Email address"
        type="email"
        placeholder="jane@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Select
        id="role"
        label="Role"
        options={roleOptions}
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
      />

      <Input
        id="phone"
        label="Phone (optional)"
        type="tel"
        placeholder="04XX XXX XXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          Send invitation
        </Button>
      </div>
    </form>
  )
}
