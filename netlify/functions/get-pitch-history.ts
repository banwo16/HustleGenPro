import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import { getAuthenticatedUser } from './_lib/verifyUser'

/**
 * Ported from the old src/lib/pitchHistory.ts. Same redaction rules:
 * free users get their MOST RECENT pitch in full, every older pitch is
 * redacted to a short teaser before it ever leaves the server. Subscribers
 * get everything unlocked.
 */

interface PitchOption {
  title: string
  pitch: string
  explanation: string
}

function truncate(text: string, maxLen: number): string {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text
}

function findOptionBody(
  pitchType: string,
  options: PitchOption[],
  revisedPitch: PitchOption,
): string {
  if (pitchType === 'revised') return revisedPitch?.pitch ?? ''
  const index =
    pitchType === 'option_a' ? 0 : pitchType === 'option_b' ? 1 : pitchType === 'option_c' ? 2 : -1
  return index >= 0 && options[index] ? options[index].pitch : ''
}

function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  const admin = getSupabaseAdmin()
  const authHeader = event.headers.authorization ?? event.headers.Authorization
  const user = await getAuthenticatedUser(admin, authHeader)

  if (!user) {
    return jsonResponse(401, { error: 'Sign in required.' })
  }

  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_subscribed')
    .eq('id', user.id)
    .maybeSingle()

  const isSubscribed = profile?.is_subscribed ?? false

  const { data: rows, error } = await admin
    .from('pitches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[get-pitch-history] Failed to load pitches:', error)
    return jsonResponse(500, { error: 'Could not load pitch history right now.' })
  }

  if (!rows || rows.length === 0) {
    return jsonResponse(200, { items: [] })
  }

  if (isSubscribed) {
    return jsonResponse(200, {
      items: rows.map((row) => ({
        id: row.id,
        locked: false,
        createdAt: row.created_at,
        jobPostInput: row.job_post_input,
        clientName: row.client_name,
        options: row.generated_options,
        coachingFeedback: row.coaching_feedback,
        revisedPitch: row.revised_pitch,
        recommendedOption: row.recommended_option,
        finalPitch: row.final_pitch,
      })),
    })
  }

  // Free user: most recent unlocked, everything else redacted server-side.
  const [mostRecent, ...older] = rows

  const unlocked = {
    id: mostRecent.id,
    locked: false,
    createdAt: mostRecent.created_at,
    jobPostInput: mostRecent.job_post_input,
    clientName: mostRecent.client_name,
    options: mostRecent.generated_options,
    coachingFeedback: mostRecent.coaching_feedback,
    revisedPitch: mostRecent.revised_pitch,
    recommendedOption: mostRecent.recommended_option,
    finalPitch: mostRecent.final_pitch,
  }

  const lockedOlder = older.map((row) => {
    const rec = row.recommended_option as { selectedTitle?: string; selectedPitchType?: string } | null
    const previewSource =
      rec?.selectedTitle && rec?.selectedPitchType
        ? findOptionBody(rec.selectedPitchType, row.generated_options ?? [], row.revised_pitch)
        : ''
    return {
      id: row.id,
      locked: true,
      createdAt: row.created_at,
      jobPostInput: truncate(row.job_post_input, 200),
      clientName: row.client_name,
      recommendedTitle: rec?.selectedTitle ?? null,
      recommendedPreview: truncate(previewSource, 80),
    }
  })

  return jsonResponse(200, { items: [unlocked, ...lockedOlder] })
}
