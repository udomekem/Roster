'use client'

import { useState } from 'react'
import { useCaseNotes, useCreateCaseNote, useToggleFlag } from '../hooks/use-case-notes'
import { useParticipants } from '@/modules/participants/hooks/use-participants'
import { useUser } from '@/hooks/use-user'
import { CaseNoteForm } from './case-note-form'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Modal,
  EmptyState,
  Loading,
  Avatar,
} from '@/components/ui'
import { FileText, Plus, Flag, UserCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const categoryBadge: Record<string, 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'> = {
  general: 'default',
  health: 'blue',
  behaviour: 'yellow',
  medication: 'purple',
  activity: 'green',
  other: 'default',
}

export function CaseNotesList() {
  const { data: user } = useUser()
  const { data: caseNotes, isLoading } = useCaseNotes()
  const { data: participants } = useParticipants()
  const createCaseNote = useCreateCaseNote()
  const toggleFlag = useToggleFlag()

  const [showCreateModal, setShowCreateModal] = useState(false)

  async function handleCreate(data: { participant_id: string; content: string; category: string }) {
    if (!user) return
    await createCaseNote.mutateAsync({
      organisation_id: user.organisation_id,
      author_id: user.id,
      ...data,
    } as never)
    setShowCreateModal(false)
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Notes</h1>
          <p className="mt-1 text-sm text-gray-500">Care documentation for participants</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>

      {!caseNotes?.length ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No case notes yet"
          description="Submit your first case note"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              New note
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {caseNotes.map((note) => {
            const n = note as typeof note & {
              participant: { id: string; full_name: string } | null
              author: { id: string; full_name: string; avatar_url: string | null } | null
            }
            return (
              <Card key={n.id} className={n.is_flagged ? 'border-red-200 bg-red-50/30' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar name={n.author?.full_name ?? '?'} src={n.author?.avatar_url} size="sm" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{n.author?.full_name}</span>
                          <span className="text-xs text-gray-400">{formatDateTime(n.created_at)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <UserCircle className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-sm text-purple-700">{n.participant?.full_name}</span>
                          {n.category && (
                            <Badge variant={categoryBadge[n.category]}>{n.category}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {(user?.role === 'super_admin' || user?.role === 'team_leader') && (
                      <button
                        onClick={() => toggleFlag.mutate({ id: n.id, isFlagged: n.is_flagged })}
                        className={`rounded-lg p-1.5 transition-colors ${
                          n.is_flagged
                            ? 'text-red-500 hover:bg-red-100'
                            : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'
                        }`}
                        title={n.is_flagged ? 'Remove flag' : 'Flag this note'}
                      >
                        <Flag className="h-4 w-4" fill={n.is_flagged ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{n.content}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New case note">
        <CaseNoteForm
          participants={(participants ?? []) as never[]}
          onSubmit={handleCreate}
          loading={createCaseNote.isPending}
        />
      </Modal>
    </div>
  )
}
