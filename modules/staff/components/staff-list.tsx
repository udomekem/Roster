'use client'

import { useState } from 'react'
import { useStaff, useUpdateStaff, useInviteStaff } from '../hooks/use-staff'
import { useUser } from '@/hooks/use-user'
import { InviteStaffForm } from './invite-staff-form'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Modal,
  EmptyState,
  Loading,
  Avatar,
} from '@/components/ui'
import { Users, Plus, Mail, Phone } from 'lucide-react'
import { ROLE_LABELS, type Role } from '@/lib/constants'

const roleBadgeVariants: Record<Role, 'blue' | 'purple' | 'default'> = {
  super_admin: 'blue',
  team_leader: 'purple',
  staff: 'default',
}

export function StaffList() {
  const { data: user } = useUser()
  const { data: staff, isLoading } = useStaff()
  const inviteStaff = useInviteStaff()
  const updateStaff = useUpdateStaff()
  const [showInviteModal, setShowInviteModal] = useState(false)

  const isSuperAdmin = user?.role === 'super_admin'

  async function handleInvite(data: { email: string; fullName: string; role: string; phone?: string }) {
    await inviteStaff.mutateAsync(data)
    setShowInviteModal(false)
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    await updateStaff.mutateAsync({ id, data: { is_active: !isActive } })
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your support workers and team leaders</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="h-4 w-4" />
            Invite staff
          </Button>
        )}
      </div>

      {!staff?.length ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No staff yet"
          description="Invite your first team member"
          action={
            isSuperAdmin && (
              <Button onClick={() => setShowInviteModal(true)}>
                <Plus className="h-4 w-4" />
                Invite staff
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <Avatar name={member.full_name} src={member.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-gray-900">{member.full_name}</h3>
                      {!member.is_active && <Badge variant="red">Inactive</Badge>}
                    </div>
                    <Badge variant={roleBadgeVariants[member.role]}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                {isSuperAdmin && member.id !== user?.id && (
                  <div className="mt-4 border-t pt-3">
                    <button
                      onClick={() => handleToggleActive(member.id, member.is_active)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {member.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite staff member">
        <InviteStaffForm onSubmit={handleInvite} loading={inviteStaff.isPending} />
      </Modal>
    </div>
  )
}
