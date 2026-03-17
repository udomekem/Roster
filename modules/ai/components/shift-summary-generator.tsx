'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, Sparkles, FileText, CheckCircle } from 'lucide-react'

export function ShiftSummaryGenerator({ shiftId }: { shiftId: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)
    setSummary(null)

    try {
      const res = await fetch('/api/ai/shift-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift_id: shiftId }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to generate summary')
      }

      const data = await res.json()
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Shift Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!summary && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="ghost"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating summary...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {summary && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
            <div className="flex items-center gap-1 text-xs text-amber-700">
              <CheckCircle className="h-3.5 w-3.5" />
              AI-generated summary
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</div>
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
