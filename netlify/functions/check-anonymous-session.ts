import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'

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

  const sessionId = event.queryStringParameters?.sessionId
  if (!sessionId) {
    return jsonResponse(400, { error: 'Missing sessionId query parameter.' })
  }

  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('anonymous_sessions')
    .select('used')
    .eq('id', sessionId)
    .maybeSingle()

  return jsonResponse(200, { used: data?.used ?? false })
}
