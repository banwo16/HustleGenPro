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
    // Not an error — an anonymous visitor clicking "notify me" just gets
    // sent to sign up first (existing frontend behavior). Nothing to log yet.
    return jsonResponse(200, { logged: false })
  }

  const { error } = await admin.from('upgrade_clicks').insert({ user_id: user.id })

  if (error) {
    console.error('[log-upgrade-click] Failed to log click:', error)
    // Non-critical — don't block the user's toast/confirmation over this.
  }

  return jsonResponse(200, { logged: !error })
}
