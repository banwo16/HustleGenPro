import { supabase } from '@/lib/supabaseClient'
import type { PitchOption } from '@/lib/pitchGenerator'

export interface UnlockedPitch {
  id: string
  locked: false
  createdAt: string
  jobPostInput: string
  clientName: string | null
  options: [PitchOption, PitchOption, PitchOption]
  coachingFeedback: string
  revisedPitch: PitchOption
  recommendedOption: {
    selectedTitle: string
    selectedPitchType: 'option_a' | 'option_b' | 'option_c' | 'revised'
    reason: string
  }
  finalPitch: string | null
}

export interface LockedPitch {
  id: string
  locked: true
  createdAt: string
  jobPostInput: string
  clientName: string | null
  recommendedTitle: string | null
  recommendedPreview: string | null
}

export type PitchHistoryItem = UnlockedPitch | LockedPitch

/**
 * Thin client wrapper around the get-pitch-history Netlify Function. All
 * the actual redaction logic (most-recent-unlocked, older-locked) now runs
 * server-side inside that function — this file just fetches and returns it.
 */
export async function loadPitchHistory(): Promise<PitchHistoryItem[]> {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    throw new Error('You must be signed in to view your pitch history.')
  }

  const response = await fetch('/.netlify/functions/get-pitch-history', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const body = await response.json().catch(() => ({ error: 'Unexpected server response.' }))

  if (!response.ok) {
    throw new Error(body.error || 'Could not load your pitch history right now.')
  }

  return body.items as PitchHistoryItem[]
}
