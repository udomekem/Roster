export const dynamic = 'force-dynamic'

'use client'

import { useUser } from '@/hooks/use-user'
import { AvailabilityCalendar } from '@/modules/availability/components/availability-calendar'
import { TeamAvailabilityView } from '@/modules/availability/components/team-availability-view'
import { PageLoading } from '@/components/ui'

export default function AvailabilityPage() {
  const { data: user, isLoading } = useUser()

  if (isLoading) return <PageLoading />

  const isAdmin = user?.role === 'super_admin' || user?.role === 'team_leader'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? 'View your team\'s availability and manage your own schedule.'
            : 'Set your availability so team leaders know when you can work.'}
        </p>
      </div>

      <AvailabilityCalendar />

      {isAdmin && <TeamAvailabilityView />}
    </div>
  )
}
