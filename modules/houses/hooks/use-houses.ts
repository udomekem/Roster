'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as housesService from '../services/houses-service'
import type { InsertTables, UpdateTables } from '@/types'

export function useHouses() {
  return useQuery({
    queryKey: ['houses'],
    queryFn: housesService.getHouses,
  })
}

export function useHouse(id: string) {
  return useQuery({
    queryKey: ['houses', id],
    queryFn: () => housesService.getHouse(id),
    enabled: !!id,
  })
}

export function useCreateHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (house: InsertTables<'houses'>) => housesService.createHouse(house),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}

export function useUpdateHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTables<'houses'> }) =>
      housesService.updateHouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}

export function useDeleteHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => housesService.deleteHouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}
