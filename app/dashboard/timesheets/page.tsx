'use client'

import { useUser } from '@/hooks/use-user'
import { FortnightSubmission } from '@/modules/timesheets/components/fortnight-submission'
import { HoursDashboard } from '@/modules/timesheets/components/hours-dashboard'
import { PageLoading } from '@/components/ui'

export default function TimesheetsPage() {
  const { data: user, isLoading } = useUser()

  if (isLoading) return <PageLoading />

  if (user?.role === 'staff') {
    return <FortnightSubmission />
  }

  return <HoursDashboard />
}
