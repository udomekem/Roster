'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useShifts } from '@/modules/rostering/hooks/use-roster'
import { useCreateBroadcast } from '../hooks/use-broadcasts'

interface Props {
  open: boolean
  onClose: () => void
}

export function CreateBroadcastModal({ open, onClose }: Props) {
  const [shiftId, setShiftId] = useState('')
  const [message, setMessage] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const { data: shifts } = useShifts({ status: 'published' })
  const createMutation = useCreateBroadcast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!shiftId) return

    createMutation.mutate(
      {
        shift_id: shiftId,
        message: message || undefined,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setShiftId('')
          setMessage('')
          setExpiresAt('')
          onClose()
        },
      }
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Broadcast Shift">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">Select a published shift...</option>
            {shifts?.map((shift) => {
              const house = shift.house as { id: string; name: string } | null
              return (
                <option key={shift.id} value={shift.id}>
                  {house?.name ?? 'Unknown'} — {shift.date} ({shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)})
                </option>
              )
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add details about what's needed..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires at (optional)</label>
          <Input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!shiftId || createMutation.isPending}>
            {createMutation.isPending ? 'Broadcasting...' : 'Broadcast Shift'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
