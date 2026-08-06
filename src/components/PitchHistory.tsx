import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Clock,
  FileText,
  Star,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PitchResults } from './PitchResults'
import { loadPitchHistory, type PitchHistoryItem } from '@/lib/pitchHistory'
import { Logo } from './Logo'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getFirstN(text: string, n: number) {
  return text.length > n ? text.slice(0, n) + '...' : text
}

export function PitchHistory() {
  const { user, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<PitchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchPitches = async () => {
      try {
        const rows = await loadPitchHistory()
        setItems(rows)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load pitch history.',
        )
      } finally {
        setLoading(false)
      }
    }
    fetchPitches()
  }, [user])

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ring" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Please sign in to view your history.</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pitch Coach
        </Link>
        <span className="text-sm font-semibold text-foreground">
          Pitch History
        </span>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-ring/30 bg-ring/5 px-4 py-1.5 text-xs font-medium text-ring">
            <Clock className="h-3.5 w-3.5" />
            Your Past Pitches
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pitch History
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your past generations and the final pitches you've saved.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-ring" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No pitches yet. Head back and generate your first one!
            </p>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Generate a Pitch
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {items.map((item, i) =>
              item.locked ? (
                <LockedHistoryCard key={item.id} item={item} index={i} />
              ) : (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                    {item.clientName && (
                      <span className="text-muted-foreground">
                        · Client: {item.clientName}
                      </span>
                    )}
                  </div>
                  <PitchResults
                    result={{
                      options: item.options,
                      coachingFeedback: item.coachingFeedback,
                      revisedPitch: item.revisedPitch,
                      recommendedOption: item.recommendedOption,
                    }}
                  />
                </motion.div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Logo className="h-5 w-5 opacity-60" />
          <p className="text-xs text-muted-foreground">
            HustleGenPro — Built for first-time freelancers. You've got this.
          </p>
        </div>
      </footer>
    </div>
  )
}

function LockedHistoryCard({
  item,
  index,
}: {
  item: Extract<PitchHistoryItem, { locked: true }>
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="space-y-3 p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground truncate">
                {getFirstN(item.jobPostInput, 100)}
              </p>
              {item.clientName && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Client: {item.clientName}
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDate(item.createdAt)}
            </span>
          </div>

          {/* Teaser line */}
          {item.recommendedTitle && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">
                  Recommended: {item.recommendedTitle}
                </p>
                {item.recommendedPreview && (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    {item.recommendedPreview}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upgrade CTA */}
          <Link to="/pricing" className="block">
            <Button size="sm" variant="outline" className="w-full gap-2">
              <Lock className="h-3.5 w-3.5" />
              Upgrade to view full pitch + copy
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
