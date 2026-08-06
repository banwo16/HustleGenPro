import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Verifies the Supabase access token sent in the Authorization header and
 * returns the authenticated user — or null if there isn't one (anonymous
 * request). This is the ONLY trustworthy way to know who's calling a
 * function; nothing sent in the request body should ever be trusted to
 * identify the user (a client could put anyone's userId in a JSON body).
 */
export async function getAuthenticatedUser(
  admin: SupabaseClient,
  authHeader: string | undefined,
): Promise<{ id: string; email: string | undefined } | null> {
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length)
  const { data, error } = await admin.auth.getUser(token)

  if (error || !data.user) return null
  return { id: data.user.id, email: data.user.email }
}
