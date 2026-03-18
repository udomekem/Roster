'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as timesheetService from '../services/timesheet-service'

export { getFortnightBounds } from '../services/timesheet-service'

export function useMyShiftsForPeriod(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: ['my-period-shifts', periodStart, periodEnd],
    queryFn: () => timesheetService.getMyShiftsForPeriod(periodStart, periodEnd),
    enabled: !!periodStart && !!periodEnd,
  })
}

export function useMySubmission(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: ['my-submission', periodStart, periodEnd],
    queryFn: () => timesheetService.getMySubmission(periodStart, periodEnd),
    enabled: !!periodStart && !!periodEnd,
  })
}

export function useSubmitFortnight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: timesheetService.submitFortnight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-submission'] })
    },
  })
}

export function useAllSubmissions(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: ['all-submissions', periodStart, periodEnd],
    queryFn: () => timesheetService.getAllSubmissions(periodStart, periodEnd),
    enabled: !!periodStart && !!periodEnd,
  })
}

export function useReviewSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reviewerId }: { id: string; status: 'approved' | 'rejected'; reviewerId: string }) =>
      timesheetService.reviewSubmission(id, status, reviewerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] })
    },
  })
}

export function useStaffHoursForPeriod(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: ['staff-hours', periodStart, periodEnd],
    queryFn: () => timesheetService.getStaffHoursForPeriod(periodStart, periodEnd),
    enabled: !!periodStart && !!periodEnd,
  })
}
