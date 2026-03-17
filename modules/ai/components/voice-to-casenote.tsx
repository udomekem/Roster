'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mic, Loader2, FileText, Sparkles } from 'lucide-react'

interface StructuredNote {
  title: string
  category: string
  content: string
}

export function VoiceToCaseNote({
  participantName,
  onUseNote,
}: {
  participantName?: string
  onUseNote?: (note: StructuredNote) => void
}) {
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<StructuredNote | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleProcess() {
    if (!transcript.trim()) return
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai/voice-to-casenote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          participant_name: participantName,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to process transcript')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Voice to Case Note
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voice Transcript
          </label>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste or type the voice transcript here... (e.g., 'Alex had a good morning, took his medication at 8am, had breakfast and then went for a walk in the garden.')"
            rows={5}
          />
        </div>

        <Button
          onClick={handleProcess}
          disabled={isProcessing || !transcript.trim()}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Convert to Case Note
            </>
          )}
        </Button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{result.title}</h4>
              <Badge variant="purple">{result.category}</Badge>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.content}</div>
            {onUseNote && (
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => onUseNote(result)}
                  className="flex items-center gap-1"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Use this note
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
