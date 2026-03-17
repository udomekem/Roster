interface AuditLogParams {
  action_type: string
  entity_type: string
  entity_id: string
  metadata?: Record<string, unknown>
}

/**
 * Log an audit event via the server-side API route.
 * The API resolves user_id and organisation_id from the session.
 * Errors are silently caught — audit failures should not block the primary action.
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch {
    // Audit logging is best-effort; don't block the caller
    console.error('Failed to write audit log')
  }
}
