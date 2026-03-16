'use client'

import { useMyAssignments, useRespondToAssignment } from '../hooks/use-roster'
import {
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Loading,
} from '@/components/ui'
import { CalendarDays, Check, X, Clock, Home } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

const statusBadge: Record<string, 'default' | 'yellow' | 'green' | 'red'> = {
  pending: 'yellow',
  accepted: 'green',
  declined: 'red',
  completed: 'green',
  no_show: 'red',
}

export function MyShifts() {
  const { data: assignments, isLoading } = useMyAssignments()
  const respond = useRespondToAssignment()

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Shifts</h1>
        <p className="mt-1 text-sm text-gray-500">Your assigned shifts</p>
      </div>

      {!assignments?.length ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No shifts assigned"
          description="You have no shift assignments yet"
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const assignment = a as typeof a & {
              shift: {
                id: string
                date: string
                start_time: string
                end_time: string
                status: string
                notes: string | null
                house: { id: string; name: string } | null
              } | null
            }
            if (!assignment.shift) return null
            return (
              <Card key={assignment.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">
                          {assignment.shift.house?.name ?? 'Unknown house'}
                        </h3>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                        <span>{formatDate(assignment.shift.date)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(assignment.shift.start_time)} – {formatTime(assignment.shift.end_time)}
                        </span>
                      </div>
                      {assignment.shift.notes && (
                        <p className="mt-1 text-sm text-gray-500">{assignment.shift.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadge[assignment.status]}>{assignment.status}</Badge>
                      {assignment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => respond.mutate({ id: assignment.id, status: 'accepted' })}
                            loading={respond.isPending}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respond.mutate({ id: assignment.id, status: 'declined' })}
                            loading={respond.isPending}
                          >
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
