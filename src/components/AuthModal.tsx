import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { subscribeAuthModal, closeAuthModal } from '@/lib/authModalStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { Logo } from './Logo'

/**
 * Replaces Blink's hosted `blink.auth.login()` popup. Rendered once at the
 * app root; any component opens it by calling `openAuthModal()` from
 * '@/lib/authModalStore' — no prop drilling needed.
 */
export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // subscribeAuthModal calls this immediately with the current value AND
    // on every future open/close — a plain state subscription, not a
    // "snapshot" style API, so this is the correct pattern here (unlike the
    // useSyncExternalStore attempt this replaces, which was broken).
    return subscribeAuthModal(setIsOpen)
  }, [])

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setEmail('')
    setPassword('')
    setError(null)
    setLoading(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      closeAuthModal()
      reset()
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: authError } =
        mode === 'signup'
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      closeAuthModal()
      reset()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
    // On success, Supabase redirects away to Google — no further action needed here.
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-sans text-sm font-semibold text-foreground">
              Hustle<span className="text-ring">Gen</span>Pro
            </span>
          </div>
          <DialogTitle>
            {mode === 'signup' ? 'Create your free account' : 'Welcome back'}
          </DialogTitle>
        </DialogHeader>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={loading}
          onClick={handleGoogleAuth}
        >
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or continue with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <button
          type="button"
          className="text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => {
            setMode((m) => (m === 'signup' ? 'signin' : 'signup'))
            setError(null)
          }}
        >
          {mode === 'signup'
            ? 'Already have an account? Sign in'
            : "Don't have an account? Create one"}
        </button>
      </DialogContent>
    </Dialog>
  )
}
