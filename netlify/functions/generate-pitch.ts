import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import { getAuthenticatedUser } from './_lib/verifyUser'
import { generatePitchServerSide } from './_lib/pitchPrompt'

const FREE_MONTHLY_LIMIT = 5

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  let payload: { jobPost?: string; clientName?: string; anonymousSessionId?: string }
  try {
    payload = JSON.parse(event.body ?? '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request body.' })
  }

  const jobPost = payload.jobPost?.trim()
  if (!jobPost || jobPost.length < 20) {
    return jsonResponse(400, {
      error: 'Please enter a valid job post or gig description (at least 20 characters).',
    })
  }
  const clientName = payload.clientName?.trim() || undefined

  const admin = getSupabaseAdmin()
  const authHeader = event.headers.authorization ?? event.headers.Authorization
  const user = await getAuthenticatedUser(admin, authHeader)

  // ── Anonymous request (no valid auth token) ──────────────────────────
  if (!user) {
    const sessionId = payload.anonymousSessionId
    if (!sessionId) {
      return jsonResponse(400, { error: 'Missing anonymous session id.' })
    }

    const { data: existing } = await admin
      .from('anonymous_sessions')
      .select('used')
      .eq('id', sessionId)
      .maybeSingle()

    if (existing?.used) {
      return jsonResponse(403, {
        error: 'Your free anonymous pitch has already been used. Please sign in to continue.',
        code: 'ANONYMOUS_LIMIT_REACHED',
      })
    }

    let result
    try {
      result = await generatePitchServerSide(jobPost, clientName)
    } catch (err) {
      return jsonResponse(502, { error: (err as Error).message })
    }

    // Mark the session used (upsert — row may or may not already exist).
    await admin.from('anonymous_sessions').upsert({ id: sessionId, used: true })

    return jsonResponse(200, { result, pitchId: null })
  }

  // ── Authenticated request ─────────────────────────────────────────────
  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_subscribed, pitches_used_this_month, usage_reset_date')
    .eq('id', user.id)
    .maybeSingle()

  const monthKey = currentMonthKey()
  const isStale = !profile || profile.usage_reset_date !== monthKey
  const currentUsage = isStale ? 0 : profile.pitches_used_this_month
  const isSubscribed = profile?.is_subscribed ?? false

  if (!isSubscribed && currentUsage >= FREE_MONTHLY_LIMIT) {
    return jsonResponse(403, {
      error: `You've used all ${FREE_MONTHLY_LIMIT} free pitches this month.`,
      code: 'USAGE_LIMIT_REACHED',
    })
  }

  let result
  try {
    result = await generatePitchServerSide(jobPost, clientName)
  } catch (err) {
    return jsonResponse(502, { error: (err as Error).message })
  }

  // Save the pitch record.
  const { data: pitchRow, error: insertError } = await admin
    .from('pitches')
    .insert({
      user_id: user.id,
      job_post_input: jobPost,
      client_name: clientName ?? null,
      generated_options: result.options,
      coaching_feedback: result.coachingFeedback,
      revised_pitch: result.revisedPitch,
      recommended_option: result.recommendedOption,
      ai_model: 'claude-sonnet-4-6',
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[generate-pitch] Failed to save pitch:', insertError)
    // The generation itself succeeded — still return it to the user even
    // though saving failed, rather than throwing away a result they paid
    // a usage credit for. Log loudly so this gets noticed.
  }

  // Increment usage (upsert handles first-time users too).
  await admin.from('user_profiles').upsert({
    id: user.id,
    pitches_used_this_month: isStale ? 1 : currentUsage + 1,
    usage_reset_date: monthKey,
  })

  return jsonResponse(200, { result, pitchId: pitchRow?.id ?? null })
}
