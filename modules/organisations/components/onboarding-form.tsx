'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent } from '@/components/ui'

export function OnboardingForm() {
  const router = useRouter()
  const [orgName, setOrgName] = useState('')
  const [abn, setAbn] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgName, abn, phone }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="orgName"
            label="Organisation name"
            type="text"
            placeholder="Sunshine Disability Services"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />

          <Input
            id="abn"
            label="ABN (optional)"
            type="text"
            placeholder="12 345 678 901"
            value={abn}
            onChange={(e) => setAbn(e.target.value)}
          />

          <Input
            id="phone"
            label="Phone (optional)"
            type="tel"
            placeholder="04XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Create organisation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
