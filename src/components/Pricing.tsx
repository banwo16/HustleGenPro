import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Check,
  ArrowRight,
  GraduationCap,
  History,
  Bell,
} from 'lucide-react'
import { openAuthModal } from '@/lib/authModalStore'
import { UpgradeCard } from './UpgradeCard'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'

export function Pricing() {
  return (
    <div className="min-h-dvh">
      {/* ── Nav Bar ── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="HustleGenPro" className="h-6 w-auto" />
          <span className="hidden text-sm font-semibold text-foreground sm:inline">
            Hustle<span className="text-ring">Gen</span>Pro
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/pricing" className="hidden rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-foreground sm:inline">
            Pricing
          </Link>
          <Button
            size="sm"
            onClick={() => openAuthModal()}
            className="gap-1.5 text-xs"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <ThemeToggle className="rounded-full" />
        </div>
      </div>

      {/* ── Hero / heading ── */}
      <section className="relative px-4 pt-12 pb-8 sm:pt-16 sm:pb-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-ring/4 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-ring/30 bg-ring/5 px-4 py-1.5 text-xs font-medium text-ring"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Simple pricing, real coaching
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-5 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Pay for the coaching, not the{' '}
            <span className="text-ring">word count.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-3 text-sm text-muted-foreground sm:text-base"
          >
            Both plans include full coaching feedback, the revised pitch, and a
            recommended version on every generation. Pro adds unlimited generations
            and personalization for every new gig.
          </motion.p>
        </div>
      </section>

      {/* ── Two-column plans ── */}
      <section className="px-4 pb-12 sm:pb-16">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground">
              Free
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-4xl font-bold text-foreground">$0</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Full coaching experience, capped at five pitches a month so you can
              really learn from each one.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ring" />
                <span>
                  <strong>5 pitch generations</strong> every month — enough to
                  apply for a few real gigs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ring" />
                <span>
                  <strong>Full structured coaching feedback</strong> on every pitch,
                  including a revised version and a recommendation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ring" />
                <span>
                  <strong>Copy and lightly edit</strong> any generated pitch before
                  sending.
                </span>
              </li>
            </ul>
            <Button
              size="lg"
              variant="outline"
              className="mt-6 w-full gap-2"
              onClick={() => openAuthModal()}
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Pro — Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <UpgradeCard variant="pricing" />
          </motion.div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Pro is in private beta. Tap "Notify Me" and we'll email you the day it
          opens up — no payment taken until then.
        </p>
      </section>

      {/* ── Free plan, deeper ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What's in every free generation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Five pitches a month is intentional — it's enough to apply, learn, and
              improve without feeling rushed.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <Sparkles className="h-5 w-5 text-ring" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                Three pitch options
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Warm & personal, task-focused, curious & consultative — one for each
                tone your future client might respond to.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <GraduationCap className="h-5 w-5 text-ring" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                Coaching feedback
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                What each pitch does well for <em>this</em> gig, what to tighten,
                and what makes it land.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <History className="h-5 w-5 text-ring" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                A strengthened final version
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A revised pitch that combines the strongest parts of the three options,
                plus the recommended one to send.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ-ish reassurance ── */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Do I need a portfolio to start?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No. The whole product is built for beginners. Pitches are written so they
              sound like a real person, not someone inventing fake experience.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">
              When does my limit reset?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              On the first of every month. There's no rollover — it's a clean fresh start.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Will Pro cost money right away?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No. Pro is in private beta and the "Notify Me" button just adds you to the
              launch list — no card details, no payment.
            </p>
          </div>
        </div>
      </section>

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
  )
}