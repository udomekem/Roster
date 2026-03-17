'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as availabilityService from '../services/availability-service'
import type { InsertTables } from '@/types'

export function useAvailability(filters?: {
  staffId?: string
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ['availability', filters],
    queryFn: () => availabilityService.getAvailability(filters),
  })
}

export function useMyAvailability(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['my-availability', dateFrom, dateTo],
    queryFn: () => availabilityService.getMyAvailability(dateFrom, dateTo),
  })
}

export function useSetAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InsertTables<'staff_availability'>) =>
      availabilityService.setAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      queryClient.invalidateQueries({ queryKey: ['my-availability'] })
    },
  })
}

export function useBulkSetAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entries: InsertTables<'staff_availability'>[]) =>
      availabilityService.bulkSetAvailability(entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      queryClient.invalidateQueries({ queryKey: ['my-availability'] })
    },
  })
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => availabilityService.deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      queryClient.invalidateQueries({ queryKey: ['my-availability'] })
    },
  })
}

export function useAvailableStaffForDate(date: string) {
  return useQuery({
    queryKey: ['available-staff', date],
    queryFn: () => availabilityService.getAvailableStaffForDate(date),
    enabled: !!date,
  })
}
