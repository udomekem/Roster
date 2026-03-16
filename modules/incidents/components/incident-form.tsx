'use client'

import { useState, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { INCIDENT_SEVERITIES, type IncidentSeverity } from '@/lib/constants'
import type { House, Participant } from '@/types'

interface IncidentFormProps {
  houses: House[]
  participants: Participant[]
  onSubmit: (data: {
    title: string
    description: string
    severity: IncidentSeverity
    house_id: string | null
    participant_id: string | null
    occurred_at: string
  }) => void
  loading?: boolean
}

const severityOptions = Object.entries(INCIDENT_SEVERITIES).map(([, value]) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))

export function IncidentForm({ houses, participants, onSubmit, loading }: IncidentFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<IncidentSeverity>('medium')
  const [houseId, setHouseId] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  )

  const houseOptions = houses.filter((h) => h.is_active).map((h) => ({ value: h.id, label: h.name }))
  const participantOptions = participants.filter((p) => p.is_active).map((p) => ({ value: p.id, label: p.full_name }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      severity,
      house_id: houseId || null,
      participant_id: participantId || null,
      occurred_at: new Date(occurredAt).toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="title"
        label="Title"
        placeholder="Brief description of the incident"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="severity"
          label="Severity"
          options={severityOptions}
          value={severity}
          onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
          required
        />

        <Input
          id="occurredAt"
          label="When did it occur?"
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="houseId"
          label="House (optional)"
          options={houseOptions}
          placeholder="Select house"
          value={houseId}
          onChange={(e) => setHouseId(e.target.value)}
        />

        <Select
          id="participantId"
          label="Participant (optional)"
          options={participantOptions}
          placeholder="Select participant"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
        />
      </div>

      <Textarea
        id="description"
        label="Description"
        placeholder="Describe what happened in detail..."
        rows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          Report incident
        </Button>
      </div>
    </form>
  )
}
