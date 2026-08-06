import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import { getAuthenticatedUser } from './_lib/verifyUser'

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

  const admin = getSupabaseAdmin()
  const authHeader = event.headers.authorization ?? event.headers.Authorization
  const user = await getAuthenticatedUser(admin, authHeader)

  if (!user) {
    return jsonResponse(401, { error: 'Sign in required.' })
  }

  let payload: { pitchId?: string; finalText?: string }
  try {
    payload = JSON.parse(event.body ?? '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request body.' })
  }

  if (!payload.pitchId || typeof payload.finalText !== 'string') {
    return jsonResponse(400, { error: 'Missing pitchId or finalText.' })
  }

  // Ownership check: only update a row that belongs to the calling user.
  // This is the exact scenario the earlier beta checklist flagged as a
  // must-test case — changing an ID in a request should never grant
  // access to someone else's data.
  const { data, error } = await admin
    .from('pitches')
    .update({ final_pitch: payload.finalText })
    .eq('id', payload.pitchId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[update-final-pitch] Failed:', error)
    return jsonResponse(500, { error: 'Could not save your edit right now.' })
  }

  if (!data) {
    // Either the pitch doesn't exist, or it belongs to someone else —
    // same response either way, so we don't leak which one it is.
    return jsonResponse(404, { error: 'Pitch not found.' })
  }

  return jsonResponse(200, { success: true })
}
