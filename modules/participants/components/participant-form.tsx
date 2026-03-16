'use client'

import { useState, type FormEvent } from 'react'
import { Button, Input, Textarea, Select } from '@/components/ui'
import type { Participant, House } from '@/types'

interface ParticipantFormProps {
  participant?: Participant
  houses: House[]
  onSubmit: (data: {
    full_name: string
    house_id: string | null
    date_of_birth: string | null
    ndis_number: string | null
    phone: string | null
    email: string | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    notes: string | null
  }) => void
  loading?: boolean
}

export function ParticipantForm({ participant, houses, onSubmit, loading }: ParticipantFormProps) {
  const [fullName, setFullName] = useState(participant?.full_name ?? '')
  const [houseId, setHouseId] = useState(participant?.house_id ?? '')
  const [dob, setDob] = useState(participant?.date_of_birth ?? '')
  const [ndisNumber, setNdisNumber] = useState(participant?.ndis_number ?? '')
  const [phone, setPhone] = useState(participant?.phone ?? '')
  const [email, setEmail] = useState(participant?.email ?? '')
  const [emergencyName, setEmergencyName] = useState(participant?.emergency_contact_name ?? '')
  const [emergencyPhone, setEmergencyPhone] = useState(participant?.emergency_contact_phone ?? '')
  const [notes, setNotes] = useState(participant?.notes ?? '')

  const houseOptions = houses
    .filter((h) => h.is_active)
    .map((h) => ({ value: h.id, label: h.name }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      full_name: fullName.trim(),
      house_id: houseId || null,
      date_of_birth: dob || null,
      ndis_number: ndisNumber.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      emergency_contact_name: emergencyName.trim() || null,
      emergency_contact_phone: emergencyPhone.trim() || null,
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="fullName"
        label="Full name"
        placeholder="Participant name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <Select
        id="houseId"
        label="House"
        options={houseOptions}
        placeholder="Select a house (optional)"
        value={houseId}
        onChange={(e) => setHouseId(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="dob"
          label="Date of birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <Input
          id="ndisNumber"
          label="NDIS number"
          placeholder="430XXXXXXX"
          value={ndisNumber}
          onChange={(e) => setNdisNumber(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="emergencyName"
          label="Emergency contact"
          placeholder="Contact name"
          value={emergencyName}
          onChange={(e) => setEmergencyName(e.target.value)}
        />
        <Input
          id="emergencyPhone"
          label="Emergency phone"
          type="tel"
          value={emergencyPhone}
          onChange={(e) => setEmergencyPhone(e.target.value)}
        />
      </div>

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Additional information..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {participant ? 'Update participant' : 'Add participant'}
        </Button>
      </div>
    </form>
  )
}
