'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as staffService from '../services/staff-service'
import type { UpdateTables } from '@/types'

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: staffService.getStaff,
  })
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.getStaffMember(id),
    enabled: !!id,
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTables<'staff_profiles'> }) =>
      staffService.updateStaffMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export function useInviteStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: staffService.inviteStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}
