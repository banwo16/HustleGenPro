import { useState, useEffect, useCallback } from 'react'

const SESSION_KEY = 'hg_anon_session'

interface AnonSession {
  used: boolean
  checking: boolean
  sessionId: string
}

/**
 * Anonymous session tracking — Supabase/Netlify version.
 *
 * The actual "used" flag is checked and set server-side (in the
 * generate-pitch and check-anonymous-session Netlify Functions), keyed by
 * a client-generated UUID stored in localStorage + a cookie backup. This
 * hook just manages that ID and asks the server what it currently knows.
 *
 * A user clearing localStorage/cookies gets a fresh, valid session — that
 * limitation existed in the original design too and isn't something this
 * migration changes; flagging it here so it isn't mistaken for a regression.
 */
export function useAnonymousSession() {
  const [state, setState] = useState<AnonSession>({
    used: false,
    checking: true,
    sessionId: '',
  })

  const getSessionId = useCallback((): string => {
    let id = localStorage.getItem(SESSION_KEY)
    if (id) return id

    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)

    try {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      document.cookie = `${SESSION_KEY}=${id};path=/;expires=${d.toUTCString()};SameSite=Lax;Secure`
    } catch {
      // Non-critical — server check still enforces this.
    }

    return id
  }, [])

  useEffect(() => {
    let cancelled = false
    const sessionId = getSessionId()

    const checkSession = async () => {
      try {
        const response = await fetch(
          `/.netlify/functions/check-anonymous-session?sessionId=${encodeURIComponent(sessionId)}`,
        )
        const body = await response.json()
        if (!cancelled) {
          setState({ used: !!body.used, checking: false, sessionId })
        }
      } catch (err) {
        console.error('[HustleGenPro] Failed to check anonymous session:', err)
        if (!cancelled) {
          setState({ used: false, checking: false, sessionId })
        }
      }
    }

    checkSession()
    return () => { cancelled = true }
  }, [getSessionId])

  /**
   * Called after a successful anonymous generation. The server already
   * marked the session used as part of that request — this just updates
   * local UI state so the AuthGate reacts immediately.
   */
  const markUsed = useCallback(() => {
    setState((s) => ({ ...s, used: true }))
  }, [])

  return { ...state, markUsed }
}
