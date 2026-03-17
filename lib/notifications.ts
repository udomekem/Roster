import type { NotificationType } from '@/lib/constants'

interface SendNotificationParams {
  user_id: string
  title: string
  body?: string
  type: NotificationType
  reference_type?: string
  reference_id?: string
}

/**
 * Send a notification to a user via the server-side API route.
 * This bypasses RLS since notifications can only be inserted via service role.
 * Errors are silently caught — notification failures should not block the primary action.
 */
export async function sendNotification(params: SendNotificationParams): Promise<void> {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch {
    // Notification delivery is best-effort; don't block the caller
    console.error('Failed to send notification')
  }
}

/**
 * Send notifications to multiple users (e.g. all admins/leaders in the org).
 */
export async function sendNotificationToMany(
  userIds: string[],
  params: Omit<SendNotificationParams, 'user_id'>
): Promise<void> {
  await Promise.allSettled(
    userIds.map((user_id) => sendNotification({ ...params, user_id }))
  )
}
