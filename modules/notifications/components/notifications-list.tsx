'use client'

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/use-notifications'
import {
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Loading,
} from '@/components/ui'
import {
  Bell,
  CalendarDays,
  FileText,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const typeIcons: Record<string, typeof Bell> = {
  shift_assigned: CalendarDays,
  shift_updated: CalendarDays,
  shift_reminder: CalendarDays,
  case_note_flagged: FileText,
  incident_created: AlertTriangle,
  general: Bell,
}

const typeBadge: Record<string, 'blue' | 'yellow' | 'red' | 'default'> = {
  shift_assigned: 'blue',
  shift_updated: 'blue',
  shift_reminder: 'yellow',
  case_note_flagged: 'yellow',
  incident_created: 'red',
  general: 'default',
}

export function NotificationsList() {
  const { data: notifications, isLoading } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            loading={markAllAsRead.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {!notifications?.length ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          description="You're all caught up"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] ?? Bell
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors ${
                  notification.is_read ? 'bg-white' : 'border-blue-100 bg-blue-50/30'
                }`}
                onClick={() => {
                  if (!notification.is_read) markAsRead.mutate(notification.id)
                }}
              >
                <CardContent className="flex items-start gap-3 py-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${
                    notification.is_read ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'font-medium text-gray-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{notification.body}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={typeBadge[notification.type]} className="text-[10px]">
                        {notification.type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-gray-400">{formatDateTime(notification.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
