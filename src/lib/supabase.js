import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are missing. Please set them in .env.local')
}

let supabaseInstance = null
try {
  // Use placeholder values to prevent createClient from throwing on empty configurations
  const url = supabaseUrl || 'https://placeholder-project.supabase.co'
  const key = supabaseAnonKey || 'placeholder-anon-key'
  supabaseInstance = createClient(url, key)
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  supabaseInstance = {
    auth: {
      getSession: async () => ({ data: { session: null }, error }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ data: null, error })
    }
  }
}

export const supabase = supabaseInstance
