'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Organisation } from '@/types'
import { useUser } from './use-user'

export function useOrganisation() {
  const supabase = createClient()
  const { data: user } = useUser()

  return useQuery({
    queryKey: ['organisation', user?.organisation_id],
    queryFn: async () => {
      if (!user?.organisation_id) return null

      const { data } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', user.organisation_id)
        .single()

      return data as Organisation | null
    },
    enabled: !!user?.organisation_id,
  })
}
