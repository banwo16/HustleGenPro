import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface ProfileState {
  used: number
  limit: number
  isSubscribed: boolean
  loading: boolean
}

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Reads the user's own profile row DIRECTLY via the Supabase client (no
 * Netlify Function needed) — this is safe because the schema's Row Level
 * Security policy only allows SELECT on a user's own row, and this is a
 * read-only display value. The real usage-limit ENFORCEMENT happens
 * server-side inside the generate-pitch function regardless of what this
 * hook shows; this is purely for the "2/5 used" counter in the UI.
 */
export function useProfile(user: User | null) {
  const [state, setState] = useState<ProfileState>({
    used: 0,
    limit: 5,
    isSubscribed: false,
    loading: true,
  })

  useEffect(() => {
    if (!user) {
      setState({ used: 0, limit: 5, isSubscribed: false, loading: false })
      return
    }

    let cancelled = false

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_subscribed, pitches_used_this_month, usage_reset_date')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return

      if (error || !data) {
        setState({ used: 0, limit: 5, isSubscribed: false, loading: false })
        return
      }

      const monthKey = currentMonthKey()
      const isStale = data.usage_reset_date !== monthKey
      setState({
        used: isStale ? 0 : data.pitches_used_this_month,
        limit: 5,
        isSubscribed: !!data.is_subscribed,
        loading: false,
      })
    }

    fetchProfile()
    return () => { cancelled = true }
  }, [user?.id])

  return state
}
