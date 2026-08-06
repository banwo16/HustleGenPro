import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the SERVICE ROLE key. This bypasses Row
 * Level Security entirely, which is exactly why it must ONLY ever be
 * imported inside netlify/functions — never in src/ (the browser bundle).
 *
 * Required environment variables (set in Netlify project settings, NOT
 * prefixed with VITE_ — that prefix is reserved for values safe to expose
 * to the browser, and this key is the opposite of safe to expose):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.',
    )
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
