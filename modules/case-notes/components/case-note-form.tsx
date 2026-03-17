'use client'

import { useState, type FormEvent } from 'react'
import { Button, Select, Textarea, FileUpload } from '@/components/ui'
import { CASE_NOTE_CATEGORIES, type CaseNoteCategory } from '@/lib/constants'
import type { Participant } from '@/types'

interface CaseNoteFormProps {
  participants: Participant[]
  onSubmit: (data: {
    participant_id: string
    content: string
    category: CaseNoteCategory
    files: File[]
  }) => void
  loading?: boolean
}

const categoryOptions = Object.entries(CASE_NOTE_CATEGORIES).map(([, value]) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))

export function CaseNoteForm({ participants, onSubmit, loading }: CaseNoteFormProps) {
  const [participantId, setParticipantId] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<CaseNoteCategory>('general')
  const [files, setFiles] = useState<File[]>([])

  const participantOptions = participants
    .filter((p) => p.is_active)
    .map((p) => ({ value: p.id, label: p.full_name }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      participant_id: participantId,
      content: content.trim(),
      category,
      files,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="participantId"
        label="Participant"
        options={participantOptions}
        placeholder="Select a participant"
        value={participantId}
        onChange={(e) => setParticipantId(e.target.value)}
        required
      />

      <Select
        id="category"
        label="Category"
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value as CaseNoteCategory)}
      />

      <Textarea
        id="content"
        label="Note"
        placeholder="Write your case note here..."
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <FileUpload
        label="Attachments (optional)"
        files={files}
        onChange={setFiles}
        accept="image/*,.pdf,.doc,.docx,.txt"
        maxFiles={5}
        maxSizeMB={10}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          Submit case note
        </Button>
      </div>
    </form>
  )
}
