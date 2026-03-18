'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading } from '@/components/ui'
import { useUser } from '@/hooks/use-user'
import { useMyShiftsForPeriod, useMySubmission, useSubmitFortnight, getFortnightBounds } from '../hooks/use-timesheets'
import { formatTime, cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Send, CheckCircle, Clock, Home } from 'lucide-react'

function formatPeriodLabel(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  return `${s.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} — ${e.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function calcHours(startTime: string, endTime: string): number {
  const s = new Date(startTime).getTime()
  const e = new Date(endTime).getTime()
  return Math.max(0, (e - s) / (1000 * 60 * 60))
}

export function FortnightSubmission() {
  const { data: user } = useUser()
  const [periodOffset, setPeriodOffset] = useState(0)

  const { start: periodStart, end: periodEnd } = useMemo(() => {
    const base = new Date()
    base.setDate(base.getDate() + periodOffset * 14)
    return getFortnightBounds(base)
  }, [periodOffset])

  const { data: shifts, isLoading: shiftsLoading } = useMyShiftsForPeriod(periodStart, periodEnd)
  const { data: submission, isLoading: subLoading } = useMySubmission(periodStart, periodEnd)
  const submitMutation = useSubmitFortnight()

  const totalHours = useMemo(() => {
    if (!shifts) return 0
    return shifts.reduce((sum, a) => {
      const shift = a.shift as { start_time: string; end_time: string } | null
      if (!shift) return sum
      return sum + calcHours(shift.start_time, shift.end_time)
    }, 0)
  }, [shifts])

  const shiftsByWeek = useMemo(() => {
    if (!shifts) return { week1: [], week2: [] }
    const midpoint = new Date(periodStart + 'T00:00:00')
    midpoint.setDate(midpoint.getDate() + 7)
    const midStr = midpoint.toISOString().split('T')[0]

    type ShiftAssignment = (typeof shifts)[number]
    const week1: ShiftAssignment[] = []
    const week2: ShiftAssignment[] = []

    for (const a of shifts) {
      const shift = a.shift as { date: string } | null
      if (!shift) continue
      if (shift.date < midStr) week1.push(a)
      else week2.push(a)
    }
    return { week1, week2 }
  }, [shifts, periodStart])

  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'approved'

  function handleSubmit() {
    if (!user) return
    submitMutation.mutate({
      organisation_id: user.organisation_id,
      staff_id: user.id,
      period_start: periodStart,
      period_end: periodEnd,
    })
  }

  if (shiftsLoading || subLoading) return <Loading />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timesheet</h1>
        <p className="mt-1 text-sm text-gray-500">Review and submit your fortnightly shifts</p>
      </div>

      {/* Period navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setPeriodOffset(0)}>Current</Button>
        <Button variant="ghost" size="sm" onClick={() => setPeriodOffset((o) => o - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[220px] text-center">
          {formatPeriodLabel(periodStart, periodEnd)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setPeriodOffset((o) => o + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</div>
                <div className="text-xs text-gray-500">Total hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{shifts?.length ?? 0}</div>
                <div className="text-xs text-gray-500">Shifts</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isSubmitted ? (
                <Badge variant={submission?.status === 'approved' ? 'green' : 'blue'}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {submission?.status === 'approved' ? 'Approved' : 'Submitted'}
                </Badge>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || !shifts?.length}
                >
                  <Send className="h-4 w-4" />
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Fortnight'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week 1 */}
      <WeekShiftList
        label={`Week 1 (${new Date(periodStart + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} — ${(() => { const d = new Date(periodStart + 'T00:00:00'); d.setDate(d.getDate() + 6); return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) })()})`}
        assignments={shiftsByWeek.week1}
      />

      {/* Week 2 */}
      <WeekShiftList
        label={`Week 2 (${(() => { const d = new Date(periodStart + 'T00:00:00'); d.setDate(d.getDate() + 7); return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) })()}  — ${new Date(periodEnd + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })})`}
        assignments={shiftsByWeek.week2}
      />
    </div>
  )
}

function WeekShiftList({ label, assignments }: { label: string; assignments: unknown[] }) {
  const hours = assignments.reduce((sum: number, a) => {
    const shift = (a as { shift: { start_time: string; end_time: string } | null }).shift
    if (!shift) return sum
    return sum + calcHours(shift.start_time, shift.end_time)
  }, 0) as number

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{label}</CardTitle>
          <span className="text-sm font-semibold text-gray-700">{hours.toFixed(1)}h</span>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No shifts this week</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => {
              const assignment = a as {
                id: string
                status: string
                shift: { id: string; date: string; start_time: string; end_time: string; house: { name: string } | null } | null
              }
              if (!assignment.shift) return null
              const h = calcHours(assignment.shift.start_time, assignment.shift.end_time)
              const dayName = new Date(assignment.shift.date + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })

              return (
                <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{dayName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Home className="h-3.5 w-3.5" />
                      {assignment.shift.house?.name ?? 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(assignment.shift.start_time)} – {formatTime(assignment.shift.end_time)}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{h.toFixed(1)}h</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
