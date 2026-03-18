'use client'

import { useUser } from '@/hooks/use-user'
import { WeeklyRoster } from '@/modules/rostering/components/weekly-roster'
import { MyShifts } from '@/modules/rostering/components/my-shifts'
import { PageLoading } from '@/components/ui'

export default function RosterPage() {
  const { data: user, isLoading } = useUser()

  if (isLoading) return <PageLoading />

  if (user?.role === 'staff') {
    return <MyShifts />
  }

  return <WeeklyRoster />
}
