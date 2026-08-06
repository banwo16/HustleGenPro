import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Bell, Check } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { openAuthModal } from '@/lib/authModalStore'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface UpgradeCardProps {
  /**
   * "limit" — shown inside the coach after the user hits their free-tier cap
   *           ("Limit Reached" framing, shorter copy).
   * "pricing" — shown on the dedicated pricing page, larger card with full
   *             benefits copy and "Notify Me" call to action.
   */
  variant?: 'limit' | 'pricing'
  profileLimit?: number
}

export function UpgradeCard({ variant = 'pricing', profileLimit = 5 }: UpgradeCardProps) {
  const { user } = useAuth()

  const handleNotify = async () => {
    if (!user) {
      // Anonymous visitor: send them to sign-up so we can associate the intent
      openAuthModal()
      return
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      await fetch('/.netlify/functions/log-upgrade-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
    } catch (err) {
      console.error('[HustleGenPro] Failed to log notify-me click:', err)
    }
    toast.success("Thanks — we'll let you know the moment Pro is ready.", {
      description: 'No payment will be taken. This is a heads-up for launch day.',
    })
  }


  if (variant === 'limit') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border border-ring/25 bg-card p-6 shadow-sm"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-ring/10 px-3 py-1 text-xs font-medium text-ring">
            <Sparkles className="h-3 w-3" />
            Limit Reached
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">
              Your coaching journey is just getting started
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              You've used your {profileLimit} free pitches this month. Upgrade to
              <strong className="text-foreground"> HustleGenPro Pro</strong> for unlimited
              pitch coaching and your full pitch history. Pro is coming soon.
            </p>
          </div>
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleNotify}
          >
            <Bell className="h-4 w-4" />
            Notify Me When Pro Launches
          </Button>
          <p className="text-xs text-muted-foreground">
            Your limit resets on the 1st of next month.
          </p>
        </div>
      </motion.div>
    )
  }

  // pricing variant
  return (
    <div className="rounded-2xl border border-ring/40 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ring/10 px-2.5 py-1 text-[11px] font-semibold text-ring">
          HustleGenPro Pro
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          Coming Soon
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-serif text-4xl font-bold text-foreground">$8</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Unlimited personalized pitch coaching for every freelance opportunity —
        create, improve, and refine pitches as you apply for new clients.
      </p>
      <ul className="mt-5 space-y-3 text-sm text-foreground">
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-ring" />
          <span>
            <strong>Deeper job-post personalization</strong> — get pitches tailored
            to each client's needs, role requirements, and project details.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-ring" />
          <span>
            <strong>Full pitch history</strong> — save and review your previous
            pitches as you improve your approach.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-ring" />
          <span>
            <strong>Ongoing coaching</strong> — learn what makes a pitch stronger
            and improve with every application.
          </span>
        </li>
      </ul>
      <Button
        size="lg"
        className="mt-6 w-full gap-2"
        onClick={handleNotify}
      >
        <Bell className="h-4 w-4" />
        Notify Me When Pro Launches
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        We'll send you a single email when Pro goes live. No spam, no payment yet.
      </p>
    </div>
  )
}