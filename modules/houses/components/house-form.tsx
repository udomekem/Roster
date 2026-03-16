'use client'

import { useState, type FormEvent } from 'react'
import { Button, Input, Textarea } from '@/components/ui'
import type { House } from '@/types'

interface HouseFormProps {
  house?: House
  onSubmit: (data: {
    name: string
    address: string
    phone: string
    capacity: number | null
    notes: string
  }) => void
  loading?: boolean
}

export function HouseForm({ house, onSubmit, loading }: HouseFormProps) {
  const [name, setName] = useState(house?.name ?? '')
  const [address, setAddress] = useState(house?.address ?? '')
  const [phone, setPhone] = useState(house?.phone ?? '')
  const [capacity, setCapacity] = useState(house?.capacity?.toString() ?? '')
  const [notes, setNotes] = useState(house?.notes ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      capacity: capacity ? parseInt(capacity, 10) : null,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label="House name"
        placeholder="e.g. Elm Street House"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        id="address"
        label="Address"
        placeholder="123 Main St, Sydney NSW 2000"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="phone"
          label="Phone"
          type="tel"
          placeholder="02 XXXX XXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          id="capacity"
          label="Capacity"
          type="number"
          placeholder="e.g. 4"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Any additional notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {house ? 'Update house' : 'Create house'}
        </Button>
      </div>
    </form>
  )
}
