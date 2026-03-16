'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardContent } from '@/components/ui'

export function ForgotPasswordForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-500">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500">
            Enter your email and we will send you a link to reset your password.
          </p>

          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
