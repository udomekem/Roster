'use client'

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { Home, Users, UserCircle, CalendarDays, AlertTriangle } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import Link from 'next/link'

interface DashboardContentProps {
  stats: {
    houses: number
    staff: number
    participants: number
  }
  upcomingShifts: Array<{
    id: string
    date: string
    start_time: string
    end_time: string
    status: string
    house: { name: string } | null
  }>
  recentIncidents: Array<{
    id: string
    title: string
    severity: string
    status: string
    created_at: string
    house: { name: string } | null
    reporter: { full_name: string } | null
  }>
}

const severityColors = {
  low: 'default' as const,
  medium: 'yellow' as const,
  high: 'red' as const,
  critical: 'red' as const,
}

export function DashboardContent({ stats, upcomingShifts, recentIncidents }: DashboardContentProps) {
  const statCards = [
    { name: 'Houses', value: stats.houses, icon: Home, href: '/dashboard/houses', color: 'text-blue-600 bg-blue-50' },
    { name: 'Staff', value: stats.staff, icon: Users, href: '/dashboard/staff', color: 'text-green-600 bg-green-50' },
    { name: 'Participants', value: stats.participants, icon: UserCircle, href: '/dashboard/participants', color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your organisation</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Upcoming Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingShifts.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming shifts</p>
            ) : (
              <ul className="space-y-3">
                {upcomingShifts.map((shift) => (
                  <li key={shift.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {shift.house?.name ?? 'Unknown house'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shift.date} &middot; {formatTime(shift.start_time)} – {formatTime(shift.end_time)}
                      </p>
                    </div>
                    <Badge variant="blue">{shift.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Open Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <p className="text-sm text-gray-500">No open incidents</p>
            ) : (
              <ul className="space-y-3">
                {recentIncidents.map((incident) => (
                  <li key={incident.id}>
                    <Link
                      href={`/dashboard/incidents/${incident.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                        <p className="text-xs text-gray-500">
                          {incident.house?.name ?? 'No house'} &middot; {incident.reporter?.full_name ?? 'Unknown'}
                        </p>
                      </div>
                      <Badge variant={severityColors[incident.severity as keyof typeof severityColors]}>
                        {incident.severity}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
