export const dynamic = 'force-dynamic'

'use client'

import { useUser } from '@/hooks/use-user'
import { RosterView } from '@/modules/rostering/components/roster-view'
import { MyShifts } from '@/modules/rostering/components/my-shifts'
import { PageLoading } from '@/components/ui'

export default function RosterPage() {
  const { data: user, isLoading } = useUser()

  if (isLoading) return <PageLoading />

  if (user?.role === 'staff') {
    return <MyShifts />
  }

  return <RosterView />
}
