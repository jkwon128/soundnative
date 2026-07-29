import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — set them in .env (see .env.example).',
  )
}

// The anon key is safe to ship to the client — it's the public key meant
// for browser use, gated by Supabase's row-level security, not a secret.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
