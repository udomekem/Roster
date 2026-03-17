export const APP_NAME = 'Roster'

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TEAM_LEADER: 'team_leader',
  STAFF: 'staff',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  team_leader: 'Team Leader',
  staff: 'Staff',
}

export const SHIFT_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type ShiftStatus = (typeof SHIFT_STATUSES)[keyof typeof SHIFT_STATUSES]

export const ASSIGNMENT_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const

export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUSES)[keyof typeof ASSIGNMENT_STATUSES]

export const CASE_NOTE_CATEGORIES = {
  GENERAL: 'general',
  HEALTH: 'health',
  BEHAVIOUR: 'behaviour',
  MEDICATION: 'medication',
  ACTIVITY: 'activity',
  OTHER: 'other',
} as const

export type CaseNoteCategory =
  (typeof CASE_NOTE_CATEGORIES)[keyof typeof CASE_NOTE_CATEGORIES]

export const INCIDENT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type IncidentSeverity =
  (typeof INCIDENT_SEVERITIES)[keyof typeof INCIDENT_SEVERITIES]

export const INCIDENT_STATUSES = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const

export type IncidentStatus =
  (typeof INCIDENT_STATUSES)[keyof typeof INCIDENT_STATUSES]

export const BROADCAST_STATUSES = {
  OPEN: 'open',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
} as const

export type BroadcastStatus =
  (typeof BROADCAST_STATUSES)[keyof typeof BROADCAST_STATUSES]

export const BROADCAST_RESPONSE_STATUSES = {
  INTERESTED: 'interested',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const

export type BroadcastResponseStatus =
  (typeof BROADCAST_RESPONSE_STATUSES)[keyof typeof BROADCAST_RESPONSE_STATUSES]

export const NOTIFICATION_TYPES = {
  SHIFT_ASSIGNED: 'shift_assigned',
  SHIFT_UPDATED: 'shift_updated',
  SHIFT_REMINDER: 'shift_reminder',
  CASE_NOTE_FLAGGED: 'case_note_flagged',
  INCIDENT_CREATED: 'incident_created',
  SHIFT_BROADCAST: 'shift_broadcast',
  BROADCAST_RESPONSE: 'broadcast_response',
  GENERAL: 'general',
} as const

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
