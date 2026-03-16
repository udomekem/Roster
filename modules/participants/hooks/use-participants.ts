'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as participantsService from '../services/participants-service'
import type { InsertTables, UpdateTables } from '@/types'

export function useParticipants() {
  return useQuery({
    queryKey: ['participants'],
    queryFn: participantsService.getParticipants,
  })
}

export function useParticipant(id: string) {
  return useQuery({
    queryKey: ['participants', id],
    queryFn: () => participantsService.getParticipant(id),
    enabled: !!id,
  })
}

export function useCreateParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (p: InsertTables<'participants'>) => participantsService.createParticipant(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTables<'participants'> }) =>
      participantsService.updateParticipant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
