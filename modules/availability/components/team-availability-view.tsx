'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { useAvailability } from '../hooks/use-availability'
import { useStaff } from '@/modules/staff/hooks/use-staff'
import { ChevronLeft, ChevronRight, Users, Check, X, Minus } from 'lucide-react'

function getWeekDates(baseDate: Date): string[] {
  const start = new Date(baseDate)
  start.setDate(start.getDate() - start.getDay() + 1) // Monday
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function TeamAvailabilityView() {
  const [weekOffset, setWeekOffset] = useState(0)

  const baseDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate])
  const dateFrom = weekDates[0]
  const dateTo = weekDates[6]

  const { data: staff } = useStaff()
  const { data: availability, isLoading } = useAvailability({ dateFrom, dateTo })

  const availabilityByStaffDate = useMemo(() => {
    const map = new Map<string, boolean>()
    availability?.forEach((a) => {
      map.set(`${a.staff_id}_${a.date}`, a.is_available)
    })
    return map
  }, [availability])

  const activeStaff = useMemo(
    () => staff?.filter((s) => s.is_active) ?? [],
    [staff]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Availability
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              This Week
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset((o) => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[180px] text-center">
              {new Date(dateFrom).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              {' — '}
              {new Date(dateTo + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset((o) => o + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500">Loading...</div>
        ) : activeStaff.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No staff members"
            description="Invite staff to start tracking availability"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-4 text-left font-medium text-gray-500 min-w-[160px]">Staff</th>
                  {weekDates.map((date, i) => (
                    <th key={date} className="pb-2 px-2 text-center font-medium text-gray-500 min-w-[60px]">
                      <div>{SHORT_DAYS[i]}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(date + 'T00:00:00').getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeStaff.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={member.full_name} src={member.avatar_url} size="sm" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{member.full_name}</div>
                          <div className="text-xs text-gray-500 capitalize">{member.role.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const key = `${member.id}_${date}`
                      const isAvailable = availabilityByStaffDate.get(key)

                      return (
                        <td key={date} className="py-2 px-2 text-center">
                          {isAvailable === true ? (
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-50">
                              <Check className="h-4 w-4 text-green-600" />
                            </span>
                          ) : isAvailable === false ? (
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-50">
                              <X className="h-4 w-4 text-red-500" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-50">
                              <Minus className="h-4 w-4 text-gray-300" />
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-600" /> Available
          </span>
          <span className="flex items-center gap-1">
            <X className="h-3 w-3 text-red-500" /> Unavailable
          </span>
          <span className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-gray-300" /> Not set
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
