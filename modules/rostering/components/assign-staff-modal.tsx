'use client'

import { Modal, Avatar, Badge, Button } from '@/components/ui'
import { ROLE_LABELS, type Role } from '@/lib/constants'
import type { StaffProfile } from '@/types'

interface AssignStaffModalProps {
  open: boolean
  onClose: () => void
  staff: StaffProfile[]
  onAssign: (staffId: string) => void
  loading?: boolean
}

export function AssignStaffModal({ open, onClose, staff, onAssign, loading }: AssignStaffModalProps) {
  const activeStaff = staff.filter((s) => s.is_active)

  return (
    <Modal open={open} onClose={onClose} title="Assign staff to shift">
      {activeStaff.length === 0 ? (
        <p className="text-sm text-gray-500">No active staff members available</p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {activeStaff.map((member) => (
            <li key={member.id}>
              <button
                onClick={() => onAssign(member.id)}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <Avatar name={member.full_name} src={member.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{member.full_name}</p>
                  <Badge variant="default" className="text-[10px]">
                    {ROLE_LABELS[member.role as Role]}
                  </Badge>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
