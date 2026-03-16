'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as caseNotesService from '../services/case-notes-service'
import type { InsertTables, UpdateTables } from '@/types'

export function useCaseNotes(filters?: { participantId?: string; authorId?: string }) {
  return useQuery({
    queryKey: ['case-notes', filters],
    queryFn: () => caseNotesService.getCaseNotes(filters),
  })
}

export function useCaseNote(id: string) {
  return useQuery({
    queryKey: ['case-notes', id],
    queryFn: () => caseNotesService.getCaseNote(id),
    enabled: !!id,
  })
}

export function useCreateCaseNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (note: InsertTables<'case_notes'>) => caseNotesService.createCaseNote(note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-notes'] }),
  })
}

export function useUpdateCaseNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTables<'case_notes'> }) =>
      caseNotesService.updateCaseNote(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-notes'] }),
  })
}

export function useToggleFlag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFlagged }: { id: string; isFlagged: boolean }) =>
      caseNotesService.toggleFlag(id, isFlagged),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-notes'] }),
  })
}
