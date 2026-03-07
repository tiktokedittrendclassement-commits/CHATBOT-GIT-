import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug log to verify if keys are loaded in local process
if (typeof window === 'undefined') {
  console.log('Supabase Server Init:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl
  })
}

if (!supabaseUrl || !supabaseAnonKey) {
  // We throw if missing to make it obvious why it's failing
  // if the user expects it to work.
  console.error('Missing Supabase environment variables in .env.local')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

export const getSupabase = () => supabase
