'use client'

import { useState } from 'react'
import { useIncidents, useCreateIncident, useUpdateIncident } from '../hooks/use-incidents'
import { useHouses } from '@/modules/houses/hooks/use-houses'
import { useParticipants } from '@/modules/participants/hooks/use-participants'
import { useUser } from '@/hooks/use-user'
import { IncidentForm } from './incident-form'
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
import { AlertTriangle, Plus, Home, UserCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const severityBadge: Record<string, 'default' | 'yellow' | 'red'> = {
  low: 'default',
  medium: 'yellow',
  high: 'red',
  critical: 'red',
}

const statusBadge: Record<string, 'default' | 'yellow' | 'green' | 'blue'> = {
  open: 'red' as 'default',
  under_review: 'yellow',
  resolved: 'green',
  closed: 'default',
}

export function IncidentsList() {
  const { data: user } = useUser()
  const { data: incidents, isLoading } = useIncidents()
  const { data: houses } = useHouses()
  const { data: participants } = useParticipants()
  const createIncident = useCreateIncident()
  const updateIncident = useUpdateIncident()

  const [showCreateModal, setShowCreateModal] = useState(false)

  const canReview = user?.role === 'super_admin' || user?.role === 'team_leader'

  async function handleCreate(data: {
    title: string
    description: string
    severity: string
    house_id: string | null
    participant_id: string | null
    occurred_at: string
  }) {
    if (!user) return
    await createIncident.mutateAsync({
      organisation_id: user.organisation_id,
      reported_by: user.id,
      ...data,
    } as never)
    setShowCreateModal(false)
  }

  async function handleStatusChange(id: string, status: string) {
    await updateIncident.mutateAsync({
      id,
      data: {
        status: status as 'open' | 'under_review' | 'resolved' | 'closed',
        ...(status === 'resolved' ? { resolved_at: new Date().toISOString(), reviewed_by: user?.id } : {}),
        ...(status === 'under_review' ? { reviewed_by: user?.id } : {}),
      },
    })
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="mt-1 text-sm text-gray-500">Report and track incidents</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Report incident
        </Button>
      </div>

      {!incidents?.length ? (
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="No incidents reported"
          description="Incidents will appear here when reported"
        />
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => {
            const i = incident as typeof incident & {
              house: { id: string; name: string } | null
              participant: { id: string; full_name: string } | null
              reporter: { id: string; full_name: string; avatar_url: string | null } | null
            }
            return (
              <Card key={i.id} className={i.severity === 'critical' ? 'border-red-200' : ''}>
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-lg p-2 ${
                        i.severity === 'critical' || i.severity === 'high'
                          ? 'bg-red-50 text-red-600'
                          : i.severity === 'medium'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-gray-50 text-gray-600'
                      }`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{i.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          {i.reporter && (
                            <span className="flex items-center gap-1">
                              <Avatar name={i.reporter.full_name} src={i.reporter.avatar_url} size="sm" />
                              {i.reporter.full_name}
                            </span>
                          )}
                          <span>&middot;</span>
                          <span>{formatDateTime(i.occurred_at)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {i.house && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Home className="h-3 w-3" /> {i.house.name}
                            </span>
                          )}
                          {i.participant && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <UserCircle className="h-3 w-3" /> {i.participant.full_name}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{i.description}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge variant={severityBadge[i.severity]}>{i.severity}</Badge>
                        <Badge variant={statusBadge[i.status]}>{i.status.replace('_', ' ')}</Badge>
                      </div>
                      {canReview && i.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(i.id, 'under_review')}
                        >
                          Start review
                        </Button>
                      )}
                      {canReview && i.status === 'under_review' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(i.id, 'resolved')}
                        >
                          Mark resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Report incident" className="max-w-xl">
        <IncidentForm
          houses={houses ?? []}
          participants={(participants ?? []) as never[]}
          onSubmit={handleCreate}
          loading={createIncident.isPending}
        />
      </Modal>
    </div>
  )
}
