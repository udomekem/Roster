'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as incidentsService from '../services/incidents-service'
import type { InsertTables, UpdateTables } from '@/types'

export function useIncidents(filters?: { status?: string; severity?: string }) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentsService.getIncidents(filters),
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: () => incidentsService.getIncident(id),
    enabled: !!id,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (incident: InsertTables<'incidents'>) => incidentsService.createIncident(incident),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  })
}

export function useUpdateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTables<'incidents'> }) =>
      incidentsService.updateIncident(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  })
}
