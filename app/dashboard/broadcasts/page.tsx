export const dynamic = 'force-dynamic'

'use client'

import { useState } from 'react'
import { useUser } from '@/hooks/use-user'
import { BroadcastList } from '@/modules/broadcasts/components/broadcast-list'
import { CreateBroadcastModal } from '@/modules/broadcasts/components/create-broadcast-modal'
import { Button } from '@/components/ui/button'
import { PageLoading } from '@/components/ui'
import { Radio, Plus } from 'lucide-react'

export default function BroadcastsPage() {
  const { data: user, isLoading } = useUser()
  const [showCreate, setShowCreate] = useState(false)

  if (isLoading) return <PageLoading />

  const isAdmin = user?.role === 'super_admin' || user?.role === 'team_leader'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Broadcasts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? 'Broadcast unfilled shifts to available staff and manage responses.'
              : 'View available shift broadcasts and express your interest.'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Broadcast Shift
          </Button>
        )}
      </div>

      <BroadcastList />

      <CreateBroadcastModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
