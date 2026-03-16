'use client'

import { useState } from 'react'
import { useShifts, useCreateShift, useUpdateShift, useAssignStaff } from '../hooks/use-roster'
import { useHouses } from '@/modules/houses/hooks/use-houses'
import { useStaff } from '@/modules/staff/hooks/use-staff'
import { useUser } from '@/hooks/use-user'
import { ShiftForm } from './shift-form'
import { AssignStaffModal } from './assign-staff-modal'
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
import { CalendarDays, Plus, UserPlus, Check, Clock } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

const statusBadge: Record<string, 'default' | 'blue' | 'yellow' | 'green' | 'red'> = {
  draft: 'default',
  published: 'blue',
  in_progress: 'yellow',
  completed: 'green',
  cancelled: 'red',
}

const assignmentBadge: Record<string, 'default' | 'yellow' | 'green' | 'red'> = {
  pending: 'yellow',
  accepted: 'green',
  declined: 'red',
  completed: 'green',
  no_show: 'red',
}

export function RosterView() {
  const { data: user } = useUser()
  const { data: houses } = useHouses()
  const { data: shifts, isLoading } = useShifts()
  const { data: staff } = useStaff()
  const createShift = useCreateShift()
  const updateShift = useUpdateShift()
  const assignStaff = useAssignStaff()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [assigningShiftId, setAssigningShiftId] = useState<string | null>(null)

  const canManage = user?.role === 'super_admin' || user?.role === 'team_leader'

  async function handleCreateShift(data: {
    house_id: string
    date: string
    start_time: string
    end_time: string
    notes: string | null
  }) {
    if (!user) return
    await createShift.mutateAsync({
      organisation_id: user.organisation_id,
      created_by: user.id,
      ...data,
    })
    setShowCreateModal(false)
  }

  async function handlePublish(id: string) {
    await updateShift.mutateAsync({ id, data: { status: 'published' } })
  }

  async function handleAssign(staffId: string) {
    if (!assigningShiftId || !user) return
    await assignStaff.mutateAsync({
      organisation_id: user.organisation_id,
      shift_id: assigningShiftId,
      staff_id: staffId,
      assigned_by: user.id,
    })
    setAssigningShiftId(null)
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roster</h1>
          <p className="mt-1 text-sm text-gray-500">Schedule and manage shifts</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            New shift
          </Button>
        )}
      </div>

      {!shifts?.length ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No shifts scheduled"
          description="Create your first shift to start rostering"
          action={
            canManage && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                New shift
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => {
            const s = shift as typeof shift & {
              house: { id: string; name: string } | null
              shift_assignments: Array<{
                id: string
                status: string
                staff: { id: string; full_name: string; avatar_url: string | null } | null
              }>
            }
            return (
              <Card key={s.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-blue-50 text-center">
                        <span className="text-xs font-medium text-blue-600">
                          {new Date(s.date).toLocaleDateString('en-AU', { weekday: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-blue-700">
                          {new Date(s.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{s.house?.name ?? 'Unknown house'}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(s.start_time)} – {formatTime(s.end_time)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadge[s.status]}>{s.status.replace('_', ' ')}</Badge>
                      {canManage && s.status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => handlePublish(s.id)}>
                          <Check className="h-3.5 w-3.5" />
                          Publish
                        </Button>
                      )}
                      {canManage && (
                        <Button size="sm" variant="ghost" onClick={() => setAssigningShiftId(s.id)}>
                          <UserPlus className="h-3.5 w-3.5" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>

                  {s.shift_assignments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                      {s.shift_assignments.map((a: { id: string; status: string; staff: { id: string; full_name: string; avatar_url: string | null } | null }) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-full border px-3 py-1">
                          <Avatar name={a.staff?.full_name ?? '?'} src={a.staff?.avatar_url} size="sm" />
                          <span className="text-sm">{a.staff?.full_name}</span>
                          <Badge variant={assignmentBadge[a.status]} className="text-[10px]">
                            {a.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create shift">
        <ShiftForm
          houses={houses ?? []}
          onSubmit={handleCreateShift}
          loading={createShift.isPending}
        />
      </Modal>

      <AssignStaffModal
        open={!!assigningShiftId}
        onClose={() => setAssigningShiftId(null)}
        staff={staff ?? []}
        onAssign={handleAssign}
        loading={assignStaff.isPending}
      />
    </div>
  )
}
