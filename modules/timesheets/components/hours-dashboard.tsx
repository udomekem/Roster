'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading, Avatar, EmptyState } from '@/components/ui'
import { useStaffHoursForPeriod, useAllSubmissions, useReviewSubmission, getFortnightBounds } from '../hooks/use-timesheets'
import { useUser } from '@/hooks/use-user'
import { EMPLOYMENT_TYPE_LABELS, type EmploymentType } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Users, Clock, AlertTriangle, Check, X, Calendar } from 'lucide-react'

const STANDARD_WEEKLY_HOURS = 38
const OVERTIME_FORTNIGHTLY = STANDARD_WEEKLY_HOURS * 2

function calcHours(startTime: string, endTime: string): number {
  const s = new Date(startTime).getTime()
  const e = new Date(endTime).getTime()
  return Math.max(0, (e - s) / (1000 * 60 * 60))
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDay()
}

const empBadgeVariant: Record<string, 'blue' | 'default' | 'purple'> = {
  full_time: 'blue',
  casual: 'default',
  agency: 'purple',
}

interface StaffHoursSummary {
  staffId: string
  fullName: string
  avatarUrl: string | null
  role: string
  employmentType: string
  totalHours: number
  week1Hours: number
  week2Hours: number
  saturdayHours: number
  sundayHours: number
  weekendHours: number
  isOvertime: boolean
  shiftCount: number
}

export function HoursDashboard() {
  const { data: user } = useUser()
  const [periodOffset, setPeriodOffset] = useState(0)

  const { start: periodStart, end: periodEnd } = useMemo(() => {
    const base = new Date()
    base.setDate(base.getDate() + periodOffset * 14)
    return getFortnightBounds(base)
  }, [periodOffset])

  const midpointStr = useMemo(() => {
    const d = new Date(periodStart + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }, [periodStart])

  const { data, isLoading } = useStaffHoursForPeriod(periodStart, periodEnd)
  const { data: submissions } = useAllSubmissions(periodStart, periodEnd)
  const reviewMutation = useReviewSubmission()

  const submissionMap = useMemo(() => {
    const map = new Map<string, { id: string; status: string }>()
    submissions?.forEach((s: { staff_id: string; id: string; status: string }) => {
      map.set(s.staff_id, { id: s.id, status: s.status })
    })
    return map
  }, [submissions])

  const staffSummaries = useMemo((): StaffHoursSummary[] => {
    if (!data) return []
    const { assignments, staffList } = data

    const hoursMap = new Map<string, {
      total: number; week1: number; week2: number
      saturday: number; sunday: number; count: number
    }>()

    for (const a of assignments) {
      const shiftArr = a.shift as unknown as { date: string; start_time: string; end_time: string }[] | null
      const shift = Array.isArray(shiftArr) ? shiftArr[0] : shiftArr
      if (!shift) continue
      const staffId = a.staff_id as string
      const hours = calcHours(shift.start_time, shift.end_time)
      const dayOfWeek = getDayOfWeek(shift.date)
      const isWeek1 = shift.date < midpointStr

      const entry = hoursMap.get(staffId) ?? { total: 0, week1: 0, week2: 0, saturday: 0, sunday: 0, count: 0 }
      entry.total += hours
      entry.count += 1
      if (isWeek1) entry.week1 += hours
      else entry.week2 += hours
      if (dayOfWeek === 6) entry.saturday += hours
      if (dayOfWeek === 0) entry.sunday += hours
      hoursMap.set(staffId, entry)
    }

    return staffList.map((s) => {
      const h = hoursMap.get(s.id) ?? { total: 0, week1: 0, week2: 0, saturday: 0, sunday: 0, count: 0 }
      const empType = (s.employment_type as string) ?? 'casual'
      return {
        staffId: s.id,
        fullName: s.full_name as string,
        avatarUrl: s.avatar_url as string | null,
        role: s.role as string,
        employmentType: empType,
        totalHours: h.total,
        week1Hours: h.week1,
        week2Hours: h.week2,
        saturdayHours: h.saturday,
        sundayHours: h.sunday,
        weekendHours: h.saturday + h.sunday,
        isOvertime: empType === 'full_time' && h.total > OVERTIME_FORTNIGHTLY,
        shiftCount: h.count,
      }
    }).sort((a, b) => b.totalHours - a.totalHours)
  }, [data, midpointStr])

  const totals = useMemo(() => {
    return staffSummaries.reduce(
      (acc, s) => ({
        hours: acc.hours + s.totalHours,
        shifts: acc.shifts + s.shiftCount,
        overtime: acc.overtime + (s.isOvertime ? 1 : 0),
        weekendHours: acc.weekendHours + s.weekendHours,
      }),
      { hours: 0, shifts: 0, overtime: 0, weekendHours: 0 }
    )
  }, [staffSummaries])

  const formatPeriod = (start: string, end: string) => {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    return `${s.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} — ${e.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hours & Timesheets</h1>
        <p className="mt-1 text-sm text-gray-500">Fortnightly hours tracking and submissions</p>
      </div>

      {/* Period navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setPeriodOffset(0)}>Current</Button>
        <Button variant="ghost" size="sm" onClick={() => setPeriodOffset((o) => o - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[220px] text-center">
          {formatPeriod(periodStart, periodEnd)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setPeriodOffset((o) => o + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Hours" value={`${totals.hours.toFixed(1)}h`} icon={<Clock className="h-5 w-5 text-blue-500" />} />
        <SummaryCard label="Total Shifts" value={String(totals.shifts)} icon={<Calendar className="h-5 w-5 text-green-500" />} />
        <SummaryCard label="Weekend Hours" value={`${totals.weekendHours.toFixed(1)}h`} icon={<Users className="h-5 w-5 text-purple-500" />} />
        <SummaryCard
          label="Overtime Staff"
          value={String(totals.overtime)}
          icon={<AlertTriangle className={cn('h-5 w-5', totals.overtime > 0 ? 'text-red-500' : 'text-gray-400')} />}
          highlight={totals.overtime > 0}
        />
      </div>

      {/* Staff hours table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Hours Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {staffSummaries.length === 0 ? (
            <EmptyState
              icon={<Users className="h-10 w-10" />}
              title="No shift data"
              description="No completed or accepted shifts found for this period"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-medium text-gray-500">Staff</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-center">Type</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-right">Week 1</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-right">Week 2</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-right">Total</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-right">Sat</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-right">Sun</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-right">Weekend</th>
                    <th className="pb-2 px-2 font-medium text-gray-500 text-center">Submission</th>
                  </tr>
                </thead>
                <tbody>
                  {staffSummaries.map((s) => {
                    const sub = submissionMap.get(s.staffId)
                    return (
                      <tr key={s.staffId} className={cn('border-b last:border-0', s.isOvertime && 'bg-red-50')}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={s.fullName} src={s.avatarUrl} size="sm" />
                            <div>
                              <div className="font-medium text-gray-900">{s.fullName}</div>
                              <div className="text-xs text-gray-500 capitalize">{s.role.replace('_', ' ')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant={empBadgeVariant[s.employmentType] ?? 'default'}>
                            {EMPLOYMENT_TYPE_LABELS[s.employmentType as EmploymentType] ?? s.employmentType}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">{s.week1Hours.toFixed(1)}h</td>
                        <td className="py-3 px-2 text-right font-medium">{s.week2Hours.toFixed(1)}h</td>
                        <td className={cn('py-3 px-2 text-right font-bold', s.isOvertime ? 'text-red-600' : 'text-gray-900')}>
                          {s.totalHours.toFixed(1)}h
                          {s.isOvertime && (
                            <div className="text-[10px] text-red-500 font-normal">
                              +{(s.totalHours - OVERTIME_FORTNIGHTLY).toFixed(1)}h OT
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-600">{s.saturdayHours > 0 ? `${s.saturdayHours.toFixed(1)}h` : '—'}</td>
                        <td className="py-3 px-2 text-right text-gray-600">{s.sundayHours > 0 ? `${s.sundayHours.toFixed(1)}h` : '—'}</td>
                        <td className={cn('py-3 px-2 text-right font-medium', s.weekendHours > 0 ? 'text-purple-600' : 'text-gray-400')}>
                          {s.weekendHours > 0 ? `${s.weekendHours.toFixed(1)}h` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {sub ? (
                            <div className="flex items-center justify-center gap-1">
                              <Badge variant={sub.status === 'approved' ? 'green' : sub.status === 'submitted' ? 'blue' : sub.status === 'rejected' ? 'red' : 'default'}>
                                {sub.status}
                              </Badge>
                              {sub.status === 'submitted' && user && (
                                <div className="flex gap-0.5">
                                  <button
                                    onClick={() => reviewMutation.mutate({ id: sub.id, status: 'approved', reviewerId: user.id })}
                                    className="rounded p-0.5 text-green-600 hover:bg-green-100"
                                    title="Approve"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => reviewMutation.mutate({ id: sub.id, status: 'rejected', reviewerId: user.id })}
                                    className="rounded p-0.5 text-red-500 hover:bg-red-100"
                                    title="Reject"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not submitted</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ label, value, icon, highlight }: { label: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className={cn('text-xl font-bold', highlight ? 'text-red-600' : 'text-gray-900')}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
