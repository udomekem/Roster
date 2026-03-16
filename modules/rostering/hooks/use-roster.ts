'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as rosterService from '../services/roster-service'
import type { InsertTables, UpdateTables } from '@/types'

export function useShifts(filters?: { houseId?: string; status?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['shifts', filters],
    queryFn: () => rosterService.getShifts(filters),
  })
}

export function useShift(id: string) {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: () => rosterService.getShift(id),
    enabled: !!id,
  })
}

export function useCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (shift: InsertTables<'shifts'>) => rosterService.createShift(shift),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  })
}

export function useUpdateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTables<'shifts'> }) =>
      rosterService.updateShift(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  })
}

export function useDeleteShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rosterService.deleteShift(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  })
}

export function useAssignStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InsertTables<'shift_assignments'>) => rosterService.assignStaff(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  })
}

export function useRespondToAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'declined' }) =>
      rosterService.respondToAssignment(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] })
    },
  })
}

export function useMyAssignments() {
  return useQuery({
    queryKey: ['my-assignments'],
    queryFn: rosterService.getMyAssignments,
  })
}
