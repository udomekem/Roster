'use client'

import { useState } from 'react'
import { useParticipants, useCreateParticipant, useUpdateParticipant } from '../hooks/use-participants'
import { useHouses } from '@/modules/houses/hooks/use-houses'
import { useUser } from '@/hooks/use-user'
import { ParticipantForm } from './participant-form'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Modal,
  EmptyState,
  Loading,
} from '@/components/ui'
import { UserCircle, Plus, Home, Phone } from 'lucide-react'
import type { Participant } from '@/types'

export function ParticipantsList() {
  const { data: user } = useUser()
  const { data: participants, isLoading } = useParticipants()
  const { data: houses } = useHouses()
  const createParticipant = useCreateParticipant()
  const updateParticipant = useUpdateParticipant()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)

  const canManage = user?.role === 'super_admin' || user?.role === 'team_leader'

  async function handleCreate(data: Record<string, unknown>) {
    if (!user) return
    await createParticipant.mutateAsync({
      organisation_id: user.organisation_id,
      ...data,
    } as never)
    setShowCreateModal(false)
  }

  async function handleUpdate(data: Record<string, unknown>) {
    if (!editingParticipant) return
    await updateParticipant.mutateAsync({
      id: editingParticipant.id,
      data: data as never,
    })
    setEditingParticipant(null)
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
          <p className="mt-1 text-sm text-gray-500">NDIS participants receiving support</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add participant
          </Button>
        )}
      </div>

      {!participants?.length ? (
        <EmptyState
          icon={<UserCircle className="h-12 w-12" />}
          title="No participants yet"
          description="Add NDIS participants to begin providing support"
          action={
            canManage && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                Add participant
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((p) => {
            const participant = p as typeof p & { house: { id: string; name: string } | null }
            return (
              <Card key={participant.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => canManage && setEditingParticipant(participant)}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                      <UserCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">{participant.full_name}</h3>
                      {participant.ndis_number && (
                        <p className="text-xs text-gray-500">NDIS: {participant.ndis_number}</p>
                      )}
                    </div>
                    <Badge variant={participant.is_active ? 'green' : 'default'} className="ml-auto shrink-0">
                      {participant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    {participant.house && (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 shrink-0" />
                        <span>{participant.house.name}</span>
                      </div>
                    )}
                    {participant.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{participant.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add participant">
        <ParticipantForm
          houses={houses ?? []}
          onSubmit={handleCreate}
          loading={createParticipant.isPending}
        />
      </Modal>

      <Modal open={!!editingParticipant} onClose={() => setEditingParticipant(null)} title="Edit participant">
        {editingParticipant && (
          <ParticipantForm
            participant={editingParticipant}
            houses={houses ?? []}
            onSubmit={handleUpdate}
            loading={updateParticipant.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
