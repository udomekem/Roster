export type { Database, Tables, InsertTables, UpdateTables, Json } from './database'

export type Organisation = Tables<'organisations'>
export type StaffProfile = Tables<'staff_profiles'>
export type House = Tables<'houses'>
export type Participant = Tables<'participants'>
export type Shift = Tables<'shifts'>
export type ShiftAssignment = Tables<'shift_assignments'>
export type CaseNote = Tables<'case_notes'>
export type CaseNoteAttachment = Tables<'case_note_attachments'>
export type Incident = Tables<'incidents'>
export type IncidentAttachment = Tables<'incident_attachments'>
export type Notification = Tables<'notifications'>
export type AuditLog = Tables<'audit_logs'>
export type StaffAvailability = Tables<'staff_availability'>
export type ShiftBroadcast = Tables<'shift_broadcasts'>
export type ShiftBroadcastResponse = Tables<'shift_broadcast_responses'>
export type ShiftSummary = Tables<'shift_summaries'>

import type { Tables } from './database'

export type ShiftWithAssignments = Tables<'shifts'> & {
  house: Tables<'houses'>
  shift_assignments: (Tables<'shift_assignments'> & {
    staff: Tables<'staff_profiles'>
  })[]
}

export type CaseNoteWithDetails = Tables<'case_notes'> & {
  participant: Tables<'participants'>
  author: Tables<'staff_profiles'>
  case_note_attachments: Tables<'case_note_attachments'>[]
}

export type IncidentWithDetails = Tables<'incidents'> & {
  house: Tables<'houses'> | null
  participant: Tables<'participants'> | null
  reporter: Tables<'staff_profiles'>
  reviewer: Tables<'staff_profiles'> | null
  incident_attachments: Tables<'incident_attachments'>[]
}

export type ShiftBroadcastWithDetails = Tables<'shift_broadcasts'> & {
  shift: Tables<'shifts'> & { house: Tables<'houses'> }
  creator: Tables<'staff_profiles'>
  shift_broadcast_responses: (Tables<'shift_broadcast_responses'> & {
    staff: Tables<'staff_profiles'>
  })[]
}
