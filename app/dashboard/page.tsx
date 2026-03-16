import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/modules/dashboard/components/dashboard-content'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: housesCount },
    { count: staffCount },
    { count: participantsCount },
    { data: upcomingShifts },
    { data: recentIncidents },
  ] = await Promise.all([
    supabase.from('houses').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('staff_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('participants').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('shifts')
      .select('*, house:houses(name)')
      .gte('date', new Date().toISOString().split('T')[0])
      .in('status', ['published', 'in_progress'])
      .order('start_time', { ascending: true })
      .limit(5),
    supabase
      .from('incidents')
      .select('*, house:houses(name), reporter:staff_profiles!reported_by(full_name)')
      .in('status', ['open', 'under_review'])
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <DashboardContent
      stats={{
        houses: housesCount ?? 0,
        staff: staffCount ?? 0,
        participants: participantsCount ?? 0,
      }}
      upcomingShifts={upcomingShifts ?? []}
      recentIncidents={recentIncidents ?? []}
    />
  )
}
