import { supabase, isSupabaseConfigured } from './supabase.js'

// Base URL of the ELP backend (the FastAPI service). Set VITE_API_BASE in a
// .env file to turn on server sync:
//   dev:  VITE_API_BASE=http://127.0.0.1:8000
//   prod: VITE_API_BASE=https://elp-api.onrender.com
// When it's unset, `isApiConfigured` is false and the per-user libs fall back
// to pure localStorage — so the app behaves exactly as before with no backend.
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export const isApiConfigured = Boolean(BASE) && isSupabaseConfigured

// The Supabase access token for the current session, or null if not signed in
// (anonymous / demo users have no token, so they stay local-only).
async function accessToken() {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || null
}

// Authenticated fetch against the backend. Returns parsed JSON, or null for
// 204s. Throws if not signed in or on a non-2xx response — callers treat a
// throw as "sync unavailable" and keep their local state.
export async function api(path, { method = 'GET', body } = {}) {
  const token = await accessToken()
  if (!token) throw new Error('not authenticated')
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`)
  return res.status === 204 ? null : res.json()
}

// Subscribe to sign-in / sign-out. Calls fn(session) on every auth change.
// No-op (returns a no-op unsubscribe) when Supabase isn't configured.
export function onAuthChange(fn) {
  if (!isSupabaseConfigured) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => fn(session))
  return () => data.subscription.unsubscribe()
}
