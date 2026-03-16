'use client'

import { useState, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import type { House } from '@/types'

interface ShiftFormProps {
  houses: House[]
  onSubmit: (data: {
    house_id: string
    date: string
    start_time: string
    end_time: string
    notes: string | null
  }) => void
  loading?: boolean
}

export function ShiftForm({ houses, onSubmit, loading }: ShiftFormProps) {
  const [houseId, setHouseId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')

  const houseOptions = houses
    .filter((h) => h.is_active)
    .map((h) => ({ value: h.id, label: h.name }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const startISO = `${date}T${startTime}:00`
    const endISO = `${date}T${endTime}:00`

    onSubmit({
      house_id: houseId,
      date,
      start_time: startISO,
      end_time: endISO,
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="houseId"
        label="House"
        options={houseOptions}
        placeholder="Select a house"
        value={houseId}
        onChange={(e) => setHouseId(e.target.value)}
        required
      />

      <Input
        id="date"
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="startTime"
          label="Start time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input
          id="endTime"
          label="End time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Shift notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          Create shift
        </Button>
      </div>
    </form>
  )
}
