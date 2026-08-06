import { createClient } from '@supabase/supabase-js'

// These must be set as environment variables in Netlify (and a local .env
// file for development). VITE_ prefix is required for Vite to expose them
// to the browser — both of these are PUBLIC/safe values (the anon key is
// designed to be exposed; it has no elevated privileges on its own, real
// enforcement happens via Row Level Security + Netlify Functions using the
// separate, private service role key).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev rather than silently breaking auth everywhere.
  console.error(
    '[HustleGenPro] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Auth and database reads will not work until these are set.',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
