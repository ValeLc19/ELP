import { useSyncExternalStore } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'

// Real authentication backed by Supabase. Session is persisted by supabase-js
// (localStorage) and kept in sync here via the auth-state listener, so a page
// refresh stays logged in. A small local "mock" user powers the ?demo preview
// without needing a real account/email.

const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

// Map a Supabase user to the shape the rest of the app expects.
function shape(u) {
  if (!u) return null
  const meta = u.user_metadata || {}
  return {
    id: u.id,
    username: u.email,
    interests: meta.interests || [],
    isBusiness: !!meta.isBusiness,
  }
}

// --- real session -----------------------------------------------------------
let realUser = null

// --- local preview user (?demo=1) -------------------------------------------
const MOCK_KEY = 'elp-mock-user'
let mockUser = readMock()
function readMock() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY) || 'null')
  } catch {
    return null
  }
}
function setMock(u) {
  mockUser = u
  if (u) localStorage.setItem(MOCK_KEY, JSON.stringify(u))
  else localStorage.removeItem(MOCK_KEY)
}

if (isSupabaseConfigured) {
  supabase.auth.getSession().then(({ data }) => {
    realUser = shape(data.session?.user)
    emit()
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    realUser = shape(session?.user)
    emit()
  })
}

export function getUser() {
  return realUser || mockUser
}

// Remember to show the welcome tour after the user verifies + logs in once.
const PENDING_ONBOARD = 'elp-pending-onboard'

export async function signUp({ username, password, interests, isBusiness }) {
  const email = String(username).trim()
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Auth is not configured yet.' }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { interests: interests || [], isBusiness: !!isBusiness },
      emailRedirectTo: `${window.location.origin}/events`,
    },
  })
  if (error) {
    const exists = /already|exists|registered/i.test(error.message)
    return { ok: false, error: error.message, exists }
  }
  // Supabase returns a user with an empty identities array when the email is
  // already registered (it hides this to prevent account enumeration).
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, exists: true, error: 'That account already exists. Try logging in.' }
  }
  localStorage.setItem(PENDING_ONBOARD, email)
  // With email confirmation on there's no session until they click the link.
  if (!data.session) return { ok: true, needsVerification: true }
  return { ok: true, firstTime: true }
}

export async function logIn(username, password) {
  const email = String(username).trim()
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Auth is not configured yet.' }
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const needsVerification = /confirm|verif|not.*confirmed/i.test(error.message)
    return { ok: false, error: error.message, needsVerification }
  }
  return { ok: true }
}

export async function logOut() {
  setMock(null)
  if (isSupabaseConfigured) await supabase.auth.signOut()
  realUser = null
  emit()
}

export async function changePassword(newPassword) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Auth is not configured yet.' }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Re-send the confirmation email (for the "check your email" screen).
export async function resendVerification(email) {
  if (!isSupabaseConfigured) return { ok: false }
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: String(email).trim(),
  })
  return { ok: !error, error: error?.message }
}

// True (once) if this user just finished the verify-then-login flow, so the
// caller can show the onboarding tour. Clears the flag when consumed.
export function consumePendingOnboard(email) {
  const pending = localStorage.getItem(PENDING_ONBOARD)
  if (pending && email && pending.toLowerCase() === String(email).toLowerCase()) {
    localStorage.removeItem(PENDING_ONBOARD)
    return true
  }
  return false
}

// Preview helper: a purely local demo user (no real account, used by ?demo=1).
export function demoSignIn() {
  setMock({ username: 'demo@elp.com', interests: ['Music', 'Outdoors', 'Food'] })
  emit()
}

// A short display name from the email (e.g. user@mail.com -> user).
export function displayName(user) {
  if (!user) return ''
  return user.username.split('@')[0]
}

// Subscribe/snapshot for useSyncExternalStore. getUser returns a stable
// reference between changes (realUser/mockUser only change on emit), so the
// snapshot is safe to read on every render.
function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useAuth() {
  // useSyncExternalStore reads the current snapshot at commit time and
  // re-subscribes correctly, so there's no window where an auth change (e.g.
  // the session hydrating from an email-confirmation redirect) is missed.
  const user = useSyncExternalStore(subscribe, getUser, getUser)
  return { user, signUp, logIn, logOut }
}
