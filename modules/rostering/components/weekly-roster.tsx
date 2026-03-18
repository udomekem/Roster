'use client'

import { useState, useMemo } from 'react'
import { useShifts, useCreateShift, useUpdateShift, useAssignStaff } from '../hooks/use-roster'
import { useHouses } from '@/modules/houses/hooks/use-houses'
import { useStaff } from '@/modules/staff/hooks/use-staff'
import { useUser } from '@/hooks/use-user'
import { ShiftForm } from './shift-form'
import { AssignStaffModal } from './assign-staff-modal'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  EmptyState,
  Loading,
  Avatar,
} from '@/components/ui'
import {
  CalendarDays,
  Plus,
  UserPlus,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react'
import { formatTime, cn } from '@/lib/utils'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const statusColor: Record<string, string> = {
  draft: 'border-l-gray-300 bg-gray-50',
  published: 'border-l-blue-400 bg-blue-50',
  in_progress: 'border-l-yellow-400 bg-yellow-50',
  completed: 'border-l-green-400 bg-green-50',
  cancelled: 'border-l-red-300 bg-red-50 opacity-60',
}

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

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatWeekDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getWeekDates(monday: Date): string[] {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    dates.push(formatWeekDate(d))
  }
  return dates
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const start = monday.toLocaleDateString('en-AU', opts)
  const end = sunday.toLocaleDateString('en-AU', { ...opts, year: 'numeric' })
  return `${start} — ${end}`
}

type ShiftRow = {
  id: string
  house_id: string
  date: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  house: { id: string; name: string } | null
  shift_assignments: Array<{
    id: string
    status: string
    staff: { id: string; full_name: string; avatar_url: string | null } | null
  }>
}

export function WeeklyRoster() {
  const { data: user } = useUser()
  const { data: houses } = useHouses()
  const { data: staff } = useStaff()
  const createShift = useCreateShift()
  const updateShift = useUpdateShift()
  const assignStaff = useAssignStaff()

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createDefaults, setCreateDefaults] = useState<{ house_id?: string; date?: string }>({})
  const [assigningShiftId, setAssigningShiftId] = useState<string | null>(null)

  const monday = useMemo(() => {
    const d = new Date()
    const mon = getMonday(d)
    mon.setDate(mon.getDate() + weekOffset * 7)
    return mon
  }, [weekOffset])

  const weekDates = useMemo(() => getWeekDates(monday), [monday])
  const dateFrom = weekDates[0]
  const dateTo = weekDates[6]

  const { data: shifts, isLoading } = useShifts({ dateFrom, dateTo })

  const activeHouses = useMemo(
    () => (houses ?? []).filter((h) => h.is_active),
    [houses]
  )

  const filteredHouses = useMemo(
    () => selectedHouseId ? activeHouses.filter((h) => h.id === selectedHouseId) : activeHouses,
    [activeHouses, selectedHouseId]
  )

  const shiftsByHouseDate = useMemo(() => {
    const map = new Map<string, ShiftRow[]>()
    const allShifts = (shifts ?? []) as ShiftRow[]
    for (const s of allShifts) {
      const key = `${s.house_id}_${s.date}`
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => a.start_time.localeCompare(b.start_time))
    }
    return map
  }, [shifts])

  const canManage = user?.role === 'super_admin' || user?.role === 'team_leader'
  const todayStr = formatWeekDate(new Date())

  function openCreateShift(houseId?: string, date?: string) {
    setCreateDefaults({ house_id: houseId, date })
    setShowCreateModal(true)
  }

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Roster</h1>
          <p className="mt-1 text-sm text-gray-500">House-based shift schedule</p>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button onClick={() => openCreateShift()}>
              <Plus className="h-4 w-4" />
              New Shift
            </Button>
          )}
        </div>
      </div>

      {/* Week navigation + house filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
            This Week
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {formatWeekRange(monday)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-gray-400" />
          <select
            value={selectedHouseId ?? ''}
            onChange={(e) => setSelectedHouseId(e.target.value || null)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All houses</option>
            {activeHouses.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster grid per house */}
      {filteredHouses.length === 0 ? (
        <EmptyState
          icon={<Home className="h-12 w-12" />}
          title="No active houses"
          description="Create a house first to start building rosters"
        />
      ) : (
        filteredHouses.map((house) => (
          <Card key={house.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Home className="h-4 w-4 text-blue-600" />
                {house.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3 sm:px-4">
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {weekDates.map((date, i) => {
                  const isToday = date === todayStr
                  const dayNum = new Date(date + 'T00:00:00').getDate()
                  const isWeekend = i >= 5
                  return (
                    <div
                      key={date}
                      className={cn(
                        'text-center py-1.5 rounded-t-lg text-xs font-medium',
                        isToday ? 'bg-blue-600 text-white' : isWeekend ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-500'
                      )}
                    >
                      <div>{DAY_LABELS[i]}</div>
                      <div className={cn('text-sm font-semibold', isToday ? 'text-white' : 'text-gray-900')}>
                        {dayNum}
                      </div>
                    </div>
                  )
                })}

                {/* Shift cells per day */}
                {weekDates.map((date, i) => {
                  const key = `${house.id}_${date}`
                  const dayShifts = shiftsByHouseDate.get(key) ?? []
                  const isWeekend = i >= 5

                  return (
                    <div
                      key={date}
                      className={cn(
                        'min-h-[100px] rounded-b-lg border border-t-0 p-1 space-y-1',
                        isWeekend ? 'bg-gray-50/50' : 'bg-white'
                      )}
                    >
                      {dayShifts.map((shift) => (
                        <ShiftCell
                          key={shift.id}
                          shift={shift}
                          canManage={canManage}
                          onPublish={() => handlePublish(shift.id)}
                          onAssign={() => setAssigningShiftId(shift.id)}
                        />
                      ))}

                      {canManage && (
                        <button
                          onClick={() => openCreateShift(house.id, date)}
                          className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 py-1 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create shift modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Shift">
        <ShiftForm
          houses={activeHouses}
          onSubmit={handleCreateShift}
          loading={createShift.isPending}
          defaultHouseId={createDefaults.house_id}
          defaultDate={createDefaults.date}
        />
      </Modal>

      {/* Assign staff modal */}
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

function ShiftCell({
  shift,
  canManage,
  onPublish,
  onAssign,
}: {
  shift: ShiftRow
  canManage: boolean
  onPublish: () => void
  onAssign: () => void
}) {
  return (
    <div className={cn('rounded border-l-2 p-1.5 text-xs', statusColor[shift.status] ?? 'bg-white')}>
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium text-gray-700 truncate">
          {formatTime(shift.start_time)} – {formatTime(shift.end_time)}
        </span>
        <Badge variant={statusBadge[shift.status]} className="text-[9px] px-1 py-0">
          {shift.status === 'in_progress' ? 'active' : shift.status}
        </Badge>
      </div>

      {/* Assigned staff */}
      {shift.shift_assignments.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {shift.shift_assignments.map((a) => (
            <div key={a.id} className="flex items-center gap-1">
              <div className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0',
                a.status === 'accepted' || a.status === 'completed' ? 'bg-green-500' :
                a.status === 'declined' || a.status === 'no_show' ? 'bg-red-500' : 'bg-yellow-500'
              )} />
              <span className="truncate text-gray-600">{a.staff?.full_name ?? '?'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {canManage && shift.status !== 'cancelled' && (
        <div className="mt-1 flex gap-1">
          {shift.status === 'draft' && (
            <button
              onClick={onPublish}
              className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Check className="h-2.5 w-2.5" /> Publish
            </button>
          )}
          <button
            onClick={onAssign}
            className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <UserPlus className="h-2.5 w-2.5" /> Assign
          </button>
        </div>
      )}
    </div>
  )
}
