'use client'

import { useState } from 'react'
import { useHouses, useCreateHouse, useUpdateHouse, useDeleteHouse } from '../hooks/use-houses'
import { useUser } from '@/hooks/use-user'
import { HouseForm } from './house-form'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Modal,
  EmptyState,
  Loading,
} from '@/components/ui'
import { Home, Plus, Pencil, Trash2, MapPin, Phone, Users } from 'lucide-react'
import type { House } from '@/types'

export function HousesList() {
  const { data: user } = useUser()
  const { data: houses, isLoading } = useHouses()
  const createHouse = useCreateHouse()
  const updateHouse = useUpdateHouse()
  const deleteHouse = useDeleteHouse()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)

  const canManage = user?.role === 'super_admin' || user?.role === 'team_leader'

  async function handleCreate(data: { name: string; address: string; phone: string; capacity: number | null; notes: string }) {
    if (!user) return
    await createHouse.mutateAsync({
      organisation_id: user.organisation_id,
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      capacity: data.capacity,
      notes: data.notes || null,
    })
    setShowCreateModal(false)
  }

  async function handleUpdate(data: { name: string; address: string; phone: string; capacity: number | null; notes: string }) {
    if (!editingHouse) return
    await updateHouse.mutateAsync({
      id: editingHouse.id,
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        capacity: data.capacity,
        notes: data.notes || null,
      },
    })
    setEditingHouse(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this house?')) return
    await deleteHouse.mutateAsync(id)
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Houses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your supported accommodation houses</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add house
          </Button>
        )}
      </div>

      {!houses?.length ? (
        <EmptyState
          icon={<Home className="h-12 w-12" />}
          title="No houses yet"
          description="Add your first house to get started"
          action={
            canManage && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                Add house
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => (
            <Card key={house.id} className="relative">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Home className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{house.name}</h3>
                      <Badge variant={house.is_active ? 'green' : 'default'}>
                        {house.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingHouse(house)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(house.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  {house.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{house.address}</span>
                    </div>
                  )}
                  {house.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{house.phone}</span>
                    </div>
                  )}
                  {house.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>Capacity: {house.capacity}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add house">
        <HouseForm onSubmit={handleCreate} loading={createHouse.isPending} />
      </Modal>

      <Modal open={!!editingHouse} onClose={() => setEditingHouse(null)} title="Edit house">
        {editingHouse && (
          <HouseForm house={editingHouse} onSubmit={handleUpdate} loading={updateHouse.isPending} />
        )}
      </Modal>
    </div>
  )
}
