import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GraduationCap, LogIn } from 'lucide-react'
import { openAuthModal } from '@/lib/authModalStore'
import type { ReactNode } from 'react'
import { Logo } from './Logo'

interface AuthGateProps {
  children: ReactNode
  /** If true, the user already used their anonymous generation */
  anonymousUsed: boolean
  /** True while the anonymous session is being checked */
  anonymousChecking: boolean
  /** Current auth state, passed down from the parent's useAuth() call — avoids
   *  having two separate sources of truth for "is this user logged in". */
  isAuthenticated: boolean
}

/**
 * Three-state gate:
 * 1. Checking: spinner (don't know yet if anonymous session exists)
 * 2. Anonymous + not used: show children (first free gen)
 * 3. Anonymous + used: show login wall ("Create a free account to continue")
 * 4. Authenticated: show children (existing flow)
 */
export function AuthGate({
  children,
  anonymousUsed,
  anonymousChecking,
  isAuthenticated,
}: AuthGateProps) {
  // Still loading auth OR anonymous session check
  if (anonymousChecking) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ring" />
      </div>
    )
  }

  // Logged in → straight through (existing flow)
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Anonymous, first visit → show the generator
  if (!anonymousUsed) {
    return <>{children}</>
  }

  // Anonymous, already used their free generation
  return <SignUpPrompt />
}

function SignUpPrompt() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="flex flex-col items-center gap-6 text-center max-w-sm"
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-ring/15 via-accent/15 to-primary/15 blur-xl" />
          <Logo className="relative h-16 w-16 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
        </div>

        {/* Wordmark */}
        <span className="font-sans text-xl font-bold tracking-tight text-foreground">
          Hustle<span className="text-ring">Gen</span>Pro
        </span>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Nice start — ready to{' '}
            <span className="text-ring">keep going</span>?
          </h1>
          <p className="text-sm text-muted-foreground">
            Your first pitch was free. Create a free account to keep generating
            (4 more free pitches this month) and save your results to your
            personal pitch history.
          </p>
        </div>

        {/* Sign In */}
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => openAuthModal()}
        >
          <LogIn className="h-4 w-4" />
          Create a Free Account
        </Button>

        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-ring" />
            No portfolio needed — just you and your hustle
          </span>
        </p>
      </motion.div>
    </div>
  )
}
