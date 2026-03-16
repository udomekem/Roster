'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { StaffProfile } from '@/types'

export function useUser() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return profile as StaffProfile | null
    },
  })
}
