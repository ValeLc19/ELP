import { createClient } from '@supabase/supabase-js'

// Real backend client. Credentials come from a gitignored .env (see
// .env.example). Both values are safe to expose in the browser — Row Level
// Security is what actually protects each user's data.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// While the keys are unset (e.g. before you paste them in), export null so the
// app keeps running on the existing localStorage mock instead of crashing.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
