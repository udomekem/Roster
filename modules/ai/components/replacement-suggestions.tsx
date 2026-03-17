'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, Star, AlertCircle } from 'lucide-react'

interface Suggestion {
  staff_id: string
  full_name: string
  avatar_url: string | null
  role: string
  familiarity_score: number
  is_available: boolean
  reason: string
}

export function ReplacementSuggestions({
  shiftId,
  date,
  onAssign,
}: {
  shiftId: string
  date: string
  onAssign?: (staffId: string) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFetch() {
    setIsLoading(true)
    setError(null)
    setSuggestions(null)

    try {
      const res = await fetch('/api/ai/suggest-replacements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift_id: shiftId, date }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to fetch suggestions')
      }

      const data = await res.json()
      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-5 w-5 text-blue-500" />
          Replacement Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!suggestions && (
          <Button
            onClick={handleFetch}
            disabled={isLoading}
            variant="ghost"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding replacements...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Find Replacements
              </>
            )}
          </Button>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {suggestions && (
          <div className="space-y-2">
            {suggestions.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No available staff found for this date. Consider broadcasting the shift.
              </div>
            ) : (
              suggestions.map((s) => (
                <div
                  key={s.staff_id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    s.is_available ? 'border-gray-200' : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={s.full_name} src={s.avatar_url} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{s.full_name}</span>
                        {s.familiarity_score > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {s.familiarity_score}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{s.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.is_available ? 'green' : 'red'}>
                      {s.is_available ? 'Available' : 'Busy'}
                    </Badge>
                    {s.is_available && onAssign && (
                      <Button size="sm" onClick={() => onAssign(s.staff_id)}>
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}

            <div className="flex justify-end pt-1">
              <Button size="sm" variant="ghost" onClick={handleFetch} disabled={isLoading}>
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
