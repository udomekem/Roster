'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'
import { useBroadcasts, useRespondToBroadcast, useAcceptBroadcastResponse, useUpdateBroadcastStatus } from '../hooks/use-broadcasts'
import { useUser } from '@/hooks/use-user'
import { formatDate } from '@/lib/utils'
import { Radio, Clock, Users, Check, X, Ban } from 'lucide-react'
import type { ShiftBroadcastWithDetails } from '@/types'

const statusVariant: Record<string, 'blue' | 'green' | 'red' | 'default'> = {
  open: 'blue',
  filled: 'green',
  cancelled: 'red',
}

export function BroadcastList() {
  const { data: user } = useUser()
  const [filter, setFilter] = useState<string | undefined>()
  const { data: broadcasts, isLoading } = useBroadcasts(filter ? { status: filter } : undefined)
  const [selectedBroadcast, setSelectedBroadcast] = useState<ShiftBroadcastWithDetails | null>(null)

  const isAdmin = user?.role === 'super_admin' || user?.role === 'team_leader'

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Shift Broadcasts
            </CardTitle>
            <div className="flex items-center gap-1">
              {['all', 'open', 'filled', 'cancelled'].map((s) => {
                const isActive = s === 'all' ? !filter : filter === s
                return (
                  <Button
                    key={s}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(s === 'all' ? undefined : s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">Loading...</div>
          ) : !broadcasts?.length ? (
            <EmptyState
              icon={<Radio className="h-10 w-10" />}
              title="No broadcasts"
              description={filter ? `No ${filter} broadcasts found` : 'No shift broadcasts have been created yet'}
            />
          ) : (
            <div className="space-y-3">
              {broadcasts.map((broadcast) => (
                <BroadcastCard
                  key={broadcast.id}
                  broadcast={broadcast}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                  onSelect={() => setSelectedBroadcast(broadcast)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBroadcast && (
        <BroadcastDetailModal
          broadcast={selectedBroadcast}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onClose={() => setSelectedBroadcast(null)}
        />
      )}
    </>
  )
}

function BroadcastCard({
  broadcast,
  isAdmin,
  currentUserId,
  onSelect,
}: {
  broadcast: ShiftBroadcastWithDetails
  isAdmin: boolean
  currentUserId?: string
  onSelect: () => void
}) {
  const respondMutation = useRespondToBroadcast()

  const myResponse = broadcast.shift_broadcast_responses?.find(
    (r) => r.staff?.id === currentUserId
  )
  const responseCount = broadcast.shift_broadcast_responses?.length ?? 0

  return (
    <div
      className="flex items-start justify-between rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900">
            {broadcast.shift?.house?.name ?? 'Unknown house'}
          </h4>
          <Badge variant={statusVariant[broadcast.status] ?? 'default'}>
            {broadcast.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {broadcast.shift?.date} &middot; {broadcast.shift?.start_time?.slice(0, 5)} — {broadcast.shift?.end_time?.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {responseCount} response{responseCount !== 1 ? 's' : ''}
          </span>
        </div>
        {broadcast.message && (
          <p className="text-sm text-gray-600 mt-1">{broadcast.message}</p>
        )}
      </div>

      {broadcast.status === 'open' && !isAdmin && !myResponse && (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            respondMutation.mutate({ broadcastId: broadcast.id, status: 'interested' })
          }}
          disabled={respondMutation.isPending}
        >
          I&apos;m Interested
        </Button>
      )}

      {myResponse && (
        <Badge variant={myResponse.status === 'accepted' ? 'green' : myResponse.status === 'rejected' ? 'red' : 'blue'}>
          {myResponse.status}
        </Badge>
      )}
    </div>
  )
}

function BroadcastDetailModal({
  broadcast,
  isAdmin,
  currentUserId,
  onClose,
}: {
  broadcast: ShiftBroadcastWithDetails
  isAdmin: boolean
  currentUserId?: string
  onClose: () => void
}) {
  const acceptMutation = useAcceptBroadcastResponse()
  const cancelMutation = useUpdateBroadcastStatus()

  return (
    <Modal open onClose={onClose} title="Broadcast Details" className="max-w-xl">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              {broadcast.shift?.house?.name ?? 'Unknown house'}
            </h3>
            <Badge variant={statusVariant[broadcast.status] ?? 'default'}>
              {broadcast.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {broadcast.shift?.date} &middot; {broadcast.shift?.start_time?.slice(0, 5)} — {broadcast.shift?.end_time?.slice(0, 5)}
          </p>
          {broadcast.message && (
            <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">{broadcast.message}</p>
          )}
          {broadcast.expires_at && (
            <p className="text-xs text-gray-400 mt-1">
              Expires: {new Date(broadcast.expires_at).toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Responses ({broadcast.shift_broadcast_responses?.length ?? 0})
          </h4>
          {broadcast.shift_broadcast_responses?.length ? (
            <div className="space-y-2">
              {broadcast.shift_broadcast_responses.map((response) => (
                <div key={response.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={response.staff?.full_name ?? ''} src={response.staff?.avatar_url} size="sm" />
                    <div>
                      <div className="text-sm font-medium">{response.staff?.full_name}</div>
                      <div className="text-xs text-gray-500 capitalize">{response.staff?.role?.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        response.status === 'accepted' ? 'green' :
                        response.status === 'rejected' ? 'red' : 'blue'
                      }
                    >
                      {response.status}
                    </Badge>
                    {isAdmin && broadcast.status === 'open' && response.status === 'interested' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => acceptMutation.mutate(response.id)}
                        disabled={acceptMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Accept
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No responses yet.</p>
          )}
        </div>

        {isAdmin && broadcast.status === 'open' && (
          <div className="flex justify-end pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                cancelMutation.mutate({ id: broadcast.id, status: 'cancelled' as const }, { onSuccess: onClose })
              }}
              disabled={cancelMutation.isPending}
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              Cancel Broadcast
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
