'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as broadcastService from '../services/broadcast-service'

export function useBroadcasts(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['broadcasts', filters],
    queryFn: () => broadcastService.getBroadcasts(filters),
  })
}

export function useBroadcast(id: string) {
  return useQuery({
    queryKey: ['broadcasts', id],
    queryFn: () => broadcastService.getBroadcast(id),
    enabled: !!id,
  })
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      shift_id: string
      message?: string
      expires_at?: string
    }) => broadcastService.createBroadcast(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  })
}

export function useRespondToBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      broadcastId,
      status,
    }: {
      broadcastId: string
      status: 'interested' | 'accepted' | 'rejected'
    }) => broadcastService.respondToBroadcast(broadcastId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  })
}

export function useUpdateBroadcastStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'open' | 'filled' | 'cancelled'
    }) => broadcastService.updateBroadcastStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  })
}

export function useAcceptBroadcastResponse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (responseId: string) =>
      broadcastService.acceptBroadcastResponse(responseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  })
}
