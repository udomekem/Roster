'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMyAvailability, useSetAvailability, useDeleteAvailability } from '../hooks/use-availability'
import { useUser } from '@/hooks/use-user'
import { ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AvailabilityCalendar() {
  const { data: user } = useUser()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const dateFrom = formatDate(year, month, 1)
  const dateTo = formatDate(year, month, getDaysInMonth(year, month))
  const { data: availability, isLoading } = useMyAvailability(dateFrom, dateTo)
  const setAvailabilityMutation = useSetAvailability()
  const deleteAvailabilityMutation = useDeleteAvailability()

  const availabilityMap = useMemo(() => {
    const map = new Map<string, { id: string; is_available: boolean; start_time: string | null; end_time: string | null; notes: string | null }>()
    availability?.forEach((a) => {
      map.set(a.date, { id: a.id, is_available: a.is_available, start_time: a.start_time, end_time: a.end_time, notes: a.notes })
    })
    return map
  }, [availability])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  function goToPreviousMonth() {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else {
      setMonth(month - 1)
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else {
      setMonth(month + 1)
    }
  }

  async function toggleAvailability(date: string, currentlyAvailable: boolean | undefined) {
    if (!user) return

    const existing = availabilityMap.get(date)
    if (existing && currentlyAvailable === true) {
      setAvailabilityMutation.mutate({
        organisation_id: user.organisation_id,
        staff_id: user.id,
        date,
        is_available: false,
      })
    } else if (existing && currentlyAvailable === false) {
      deleteAvailabilityMutation.mutate(existing.id)
    } else {
      setAvailabilityMutation.mutate({
        organisation_id: user.organisation_id,
        staff_id: user.id,
        date,
        is_available: true,
      })
    }
  }

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Availability</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-green-100 border border-green-300" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-red-100 border border-red-300" />
            Unavailable
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-gray-100 border border-gray-300" />
            Not set
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((label) => (
                <div key={label} className="text-center text-xs font-medium text-gray-500 py-1">
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = formatDate(year, month, day)
                const entry = availabilityMap.get(date)
                const isToday = date === todayStr
                const isPast = date < todayStr
                const isSelected = date === selectedDate

                let bgClass = 'bg-gray-50 hover:bg-gray-100'
                if (entry?.is_available === true) bgClass = 'bg-green-50 hover:bg-green-100 border-green-200'
                if (entry?.is_available === false) bgClass = 'bg-red-50 hover:bg-red-100 border-red-200'

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (!isPast) {
                        toggleAvailability(date, entry?.is_available)
                        setSelectedDate(date)
                      }
                    }}
                    disabled={isPast}
                    className={`
                      relative flex flex-col items-center justify-center rounded-lg border p-2 text-sm transition-colors
                      ${bgClass}
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${isSelected ? 'ring-2 ring-blue-400' : ''}
                      ${isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {day}
                    </span>
                    {entry && (
                      <span className="mt-0.5">
                        {entry.is_available ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {selectedDate && (
          <SelectedDateDetails
            date={selectedDate}
            entry={availabilityMap.get(selectedDate)}
            user={user}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}

function SelectedDateDetails({
  date,
  entry,
  user,
  onClose,
}: {
  date: string
  entry?: { id: string; is_available: boolean; start_time: string | null; end_time: string | null; notes: string | null }
  user: { id: string; organisation_id: string } | null | undefined
  onClose: () => void
}) {
  const setAvailabilityMutation = useSetAvailability()

  const [startTime, setStartTime] = useState(entry?.start_time || '')
  const [endTime, setEndTime] = useState(entry?.end_time || '')
  const [notes, setNotes] = useState(entry?.notes || '')

  function handleSave() {
    if (!user) return
    setAvailabilityMutation.mutate(
      {
        organisation_id: user.organisation_id,
        staff_id: user.id,
        date,
        is_available: true,
        start_time: startTime || null,
        end_time: endTime || null,
        notes: notes || null,
      },
      { onSuccess: onClose }
    )
  }

  const displayDate = new Date(date + 'T00:00:00')

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          {displayDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h4>
        <Badge variant={entry?.is_available ? 'green' : entry?.is_available === false ? 'red' : 'default'}>
          {entry?.is_available ? 'Available' : entry?.is_available === false ? 'Unavailable' : 'Not set'}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2 text-sm">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              placeholder="Start"
            />
            <span className="text-gray-400">to</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              placeholder="End"
            />
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
          rows={2}
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={setAvailabilityMutation.isPending}
          >
            {setAvailabilityMutation.isPending ? 'Saving...' : 'Save Details'}
          </Button>
        </div>
      </div>
    </div>
  )
}
