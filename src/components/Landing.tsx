import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Check,
  GraduationCap,
  ArrowRight,
  History,
  Zap,
  ShieldCheck,
} from 'lucide-react'
import { openAuthModal } from '@/lib/authModalStore'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'

export function Landing() {
  return (
    <div className="min-h-dvh">
      {/* ── Nav Bar ── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="h-6 w-6" />
          <span className="hidden text-sm font-semibold text-foreground sm:inline">
            Hustle<span className="text-ring">Gen</span>Pro
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/pricing"
            className="hidden rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
          >
            Pricing
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAuthModal()}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            Sign in
          </Button>
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

      {/* ── Hero ── */}
      <section className="relative px-4 pt-16 pb-16 sm:pt-20 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-ring/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-6 flex flex-col items-center gap-4"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-ring/10 via-accent/10 to-primary/10 blur-xl" />
              <Logo className="relative h-20 w-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:h-24 sm:w-24" />
            </div>
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-ring/30 bg-ring/5 px-4 py-1.5 text-xs font-medium text-ring"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Pitch coach, not just a pitch generator
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-6 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Write client pitches that{' '}
            <span className="text-ring">actually get replies</span>,<br />
            even with zero experience.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-5 text-base text-muted-foreground sm:text-lg"
          >
            Paste a job post. Get three personalized pitch options plus coaching feedback
            that explains what works — built for first-time freelancers landing their
            first client, not for power users with portfolios to flex.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={() => openAuthModal()}
              className="w-full gap-2 sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Try it free — no card needed
            </Button>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full gap-2">
                See pricing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-xs text-muted-foreground"
          >
            5 free pitches every month. No credit card. Cancel any time.
          </motion.p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How HustleGenPro coaches your first pitch
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Three pitch styles, one coaching pass — so you learn what works, not
              just what to send.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: 'Paste the gig',
                body: 'Drop in the job post — full text, your budget, whatever you have. We work with real listings, not templates.',
              },
              {
                icon: <GraduationCap className="h-5 w-5" />,
                title: 'Get three pitches',
                body: 'A warm one, a task-focused one, a curious one. Each is written so it sounds like a real person — not a portfolio flex.',
              },
              {
                icon: <History className="h-5 w-5" />,
                title: 'Read the coaching',
                body: 'See why each pitch works for THIS job, get a strengthened final version, and save it to your pitch history.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ring/10 text-ring">
                  {step.icon}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Positioning ── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-ring/10 px-2.5 py-1 text-[11px] font-medium text-ring">
                <Zap className="h-3 w-3" />
                Built for first-timers
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">
                No fake experience invented
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Pitches sound like a real beginner freelancer — confident without
                padding. We never invent clients, projects, or results you don't have.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-ring/10 px-2.5 py-1 text-[11px] font-medium text-ring">
                <GraduationCap className="h-3 w-3" />
                Coaching, not just generation
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">
                You get better with every pitch
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                The feedback explains <em>why</em> each pitch works for the gig you
                pasted. Next time you apply, you'll catch the same patterns on your own.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-ring/30 bg-ring/5 p-6 text-center sm:p-8">
            <ShieldCheck className="mx-auto h-7 w-7 text-ring" />
            <h3 className="mt-3 font-serif text-xl font-bold text-foreground sm:text-2xl">
              Free to start, no card needed
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Five pitch generations a month, full coaching feedback, and your
              personal pitch history. Pro is in private beta — join the list to
              hear when it opens up.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => openAuthModal()}
                className="w-full gap-2 sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                Get started — it's free
              </Button>
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full gap-2">
                  View pricing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/logo.png"
            alt="HustleGenPro"
            className="h-5 w-auto opacity-60"
          />
          <p className="text-xs text-muted-foreground">
            HustleGenPro — Built for first-time freelancers. You've got this.
          </p>
        </div>
      </footer>
    </div>
  )
}