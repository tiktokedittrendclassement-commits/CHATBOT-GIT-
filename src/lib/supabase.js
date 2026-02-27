
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Exporting a getter instead of a constant to avoid build-time issues
export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

// Safe mock for local development without env vars
const createMockClient = () => {
  console.warn('Supabase: Missing environment variables. Using mock client.')
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        // Callback is ignored in mock but accepted to avoid errors
        return { data: { subscription: { unsubscribe: () => { } } } }
      },
      signInWithOAuth: async () => {
        console.error('Supabase Mock: signInWithOAuth called but no keys configured.')
        return { data: null, error: new Error('Mock: Keys missing') }
      },
      updateUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { code: 'PGRST116', message: 'Mock: Not found' } }),
          order: () => ({ data: [], error: null }),
          in: () => ({ order: async () => ({ data: [], error: null }) }),
        }),
        order: async () => ({ data: [], error: null }),
      }),
      update: () => ({ eq: async () => ({ error: null }) }),
      insert: async () => ({ error: null }),
      upsert: async () => ({ error: null }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      })
    }
  }
}

// Keep legacy export for browser usage where env vars are available
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  : createMockClient()
