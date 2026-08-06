import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
}

/**
 * Auth state hook — Supabase equivalent of the old Blink useAuth.ts.
 * Same shape/behavior as before (user, isLoading, signOut) so every
 * component that already consumes this hook needs no changes.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })

  useEffect(() => {
    let cancelled = false

    // Check the current session once on mount.
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setState({ user: data.session?.user ?? null, isLoading: false })
      }
    })

    // Stay in sync with login/logout/token refresh events.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setState({ user: session?.user ?? null, isLoading: false })
      }
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { ...state, signOut }
}
