import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Loader2, User, GraduationCap, LogOut, History, LogIn, Zap } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { openAuthModal } from '@/lib/authModalStore'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { useAnonymousSession } from '@/hooks/useAnonymousSession'
import { useProfile } from '@/hooks/useProfile'
import { generatePitch, PitchLimitError, type PitchResult } from '@/lib/pitchGenerator'
import { PitchResults } from './PitchResults'
import { ThemeToggle } from './ThemeToggle'
import { AuthGate } from './AuthGate'
import { UpgradeCard } from './UpgradeCard'
import { toast } from 'sonner'
import { Logo } from './Logo'

export function PitchCoach() {
  const { user, signOut, isLoading: authLoading } = useAuth()
  const { used: anonymousUsed, checking: anonymousChecking, markUsed, sessionId } = useAnonymousSession()
  const { used: profileUsed, limit: profileLimit, isSubscribed: isProUser, loading: profileLoading } = useProfile(user)

  const [jobPost, setJobPost] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PitchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [pitchId, setPitchId] = useState<string | null>(null)
  const [usageLimit, setUsageLimit] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const wordCount = jobPost.trim() ? jobPost.trim().split(/\s+/).length : 0
  const MIN_WORDS = 20
  const usedCount = isProUser ? 0 : profileUsed
  const usageLimitReached = !isProUser && !profileLoading && profileUsed >= profileLimit

  const isAuthenticated = !!user

  // ── Generate ─────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    const trimmed = jobPost.trim()
    if (!trimmed) return

    const words = trimmed.split(/\s+/).length
    if (words < MIN_WORDS) {
      setWarning(
        `That's only ${words} word${words === 1 ? '' : 's'}. Paste the full job post or gig description (at least ${MIN_WORDS} words) so I can tailor pitches that actually fit the role.`,
      )
      return
    }

    setLoading(true)
    setError(null)
    setWarning(null)
    setResult(null)
    setPitchId(null)
    setUsageLimit(false)

    try {
      // The generate-pitch function now handles EVERYTHING server-side:
      // checking the usage limit (or anonymous session), calling the AI,
      // saving the pitch record, and incrementing usage — all in one call,
      // verified against the database, never trusting anything the client
      // believes about its own limit or subscription status.
      const { result: pitchResult, pitchId: newPitchId } = await generatePitch(
        trimmed,
        clientName.trim() || undefined,
        isAuthenticated ? undefined : sessionId,
      )

      if (isAuthenticated) {
        setPitchId(newPitchId)
      } else {
        // Anonymous → the server already marked the session used; just
        // update local UI state so AuthGate reacts on the next render.
        markUsed()
      }

      setResult(pitchResult)
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch (err) {
      if (err instanceof PitchLimitError) {
        if (err.code === 'USAGE_LIMIT_REACHED') {
          setUsageLimit(true)
        } else {
          // Anonymous limit hit (e.g. a second tab) — the AuthGate already
          // handles this state once `markUsed()` reflects it.
          markUsed()
        }
        return
      }
      // Friendly message only — the function never sends raw error details,
      // so there's nothing technical to accidentally expose here anymore.
      console.error('[HustleGenPro] Generation failed:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Something unexpected happened on our end. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFinalPitchSaved = async (finalText: string) => {
    if (!pitchId || !isAuthenticated) return
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      const response = await fetch('/.netlify/functions/update-final-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ pitchId, finalText }),
      })
      if (!response.ok) throw new Error('Save failed')
      toast.success('Final pitch saved!')
    } catch {
      // Non-blocking
    }
  }

  // ── AuthGate wrapper decides what to render ──
  return (
    <AuthGate
      anonymousUsed={anonymousUsed}
      anonymousChecking={anonymousChecking || authLoading}
      isAuthenticated={!!user}
    >
      <div className="min-h-dvh">
        {/* ── Nav Bar ── */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-6" />
            <span className="hidden text-sm font-semibold text-foreground sm:inline">
              Hustle<span className="text-ring">Gen</span>Pro
            </span>
            {/* Usage counter for authenticated free users */}
            {isAuthenticated && !isProUser && !profileLoading && (
              <span className="hidden rounded-full border border-ring/25 bg-ring/5 px-2.5 py-0.5 text-[11px] font-medium text-ring sm:inline">
                {usedCount}/{profileLimit} free this month
              </span>
            )}
            {isAuthenticated && isProUser && (
              <span className="hidden rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground sm:inline-flex items-center gap-1">
                <Zap className="h-3 w-3" /> Pro
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/pricing"
              className="hidden rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
            >
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/history"
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <History className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">History</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal()}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
            <ThemeToggle className="rounded-full" />
          </div>
        </div>

        {/* ── Hero / Input Section ── */}
        <section className="relative px-4 pt-12 pb-12 sm:pt-16 sm:pb-16">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-ring/4 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            {/* ── Logo + Brand ── */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-8 flex flex-col items-center gap-4"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-ring/10 via-accent/10 to-primary/10 blur-xl" />
                <Logo className="relative h-20 w-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:h-24 sm:w-24" />
              </div>
              <div className="text-center">
                <span className="font-sans text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Hustle<span className="text-ring">Gen</span>Pro
                </span>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-6 flex justify-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ring/30 bg-ring/5 px-4 py-1.5 text-xs font-medium text-ring">
                <GraduationCap className="h-3.5 w-3.5" />
                AI Pitch Coach
              </span>
            </motion.div>

            {/* Anonymous trial banner */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="mb-6 rounded-lg border border-ring/20 bg-ring/5 px-4 py-3 text-center"
              >
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-ring">Free trial — </span>
                  one pitch, no account needed. Sign in to save your results
                  and generate more.
                </p>
              </motion.div>
            )}

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <h1 className="text-center font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Your first pitch,{' '}
                <span className="text-ring">done right.</span>
              </h1>
              <p className="mt-4 text-center text-base text-muted-foreground sm:text-lg">
                Paste a job post, and HustleGenPro will craft three personalized pitch
                options with coaching feedback — built for freelancers landing their
                first client.
              </p>
            </motion.div>

            {/* Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <Card className="mt-8">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  {/* Job Post */}
                  <div className="space-y-2">
                    <Label htmlFor="job-post" className="text-sm font-medium">
                      Job Post / Gig Description
                    </Label>
                    <Textarea
                      id="job-post"
                      placeholder={
                        'e.g. "Looking for a freelance writer to create 4 blog posts per month about home organization and decluttering. Topics will be provided. Budget: $150 per post. No prior experience required — just a strong writing voice and attention to detail."'
                      }
                      className="min-h-36"
                      value={jobPost}
                      onChange={(e) => {
                        setJobPost(e.target.value)
                        setWarning(null)
                      }}
                      disabled={loading}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${
                          jobPost.trim() && wordCount < MIN_WORDS
                            ? 'text-amber-500'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {wordCount} / {MIN_WORDS} words minimum
                      </span>
                      {/* Mobile usage counter */}
                      {isAuthenticated && !isProUser && !profileLoading && (
                        <span className="text-xs text-ring sm:hidden">
                          {usedCount}/{profileLimit} free
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client Name (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="client-name" className="text-sm font-medium text-muted-foreground">
                      Client's Name <span className="text-xs">(optional)</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="client-name"
                        placeholder="e.g. Sarah"
                        className="pl-9"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!jobPost.trim() || loading}
                    size="lg"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Crafting your pitches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Pitch
                      </>
                    )}
                  </Button>
                  {loading && (
                    <p className="text-center text-xs text-muted-foreground">
                      Building three pitch options, coaching feedback, and your recommended version — this can take up to a minute, worth the wait.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Warning */}
            {warning && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
              >
                {warning}
              </motion.div>
            )}

            {/* Usage Limit — Upgrade Card */}
            {usageLimit && <UpgradeCard variant="limit" profileLimit={profileLimit} />}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                role="alert"
              >
                <p className="font-semibold">We couldn't generate your pitches just now.</p>
                <p className="mt-1 text-destructive/90">{error}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Try clicking <strong>Generate Pitch</strong> again — most issues clear
                  on the next attempt. If it keeps failing, please come back in a few minutes.
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── Results Section ── */}
        {result && (
          <div ref={resultsRef}>
            <PitchResults result={result} onFinalPitchSaved={handleFinalPitchSaved} />
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="border-t border-border px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <Logo className="h-5 w-5 opacity-60" />
            <p className="text-xs text-muted-foreground">
              HustleGenPro — Built for first-time freelancers. You've got this.
            </p>
          </div>
        </footer>
      </div>
    </AuthGate>
  )
}
