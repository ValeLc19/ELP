import { useEffect, useReducer } from 'react'
import { isApiConfigured, api, onAuthChange } from './api.js'

// Persisted set of saved event series ids (recurring instances share a save).
//
// Local-first: localStorage is the instant source of truth for the UI. When a
// backend is configured (VITE_API_BASE) *and* a real user is signed in, saves
// also sync to `/me/saved`, so they survive a cache clear and follow the user
// across devices. Every server call is best-effort — a failure leaves the
// local state untouched, so the app keeps working offline / without a backend.
const KEY = 'elp-saved-events'

function read() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'))
  } catch {
    return new Set()
  }
}

let saved = read()
const listeners = new Set()

function emit() {
  localStorage.setItem(KEY, JSON.stringify([...saved]))
  listeners.forEach((fn) => fn())
}

export function isSaved(id) {
  return saved.has(id)
}

export function toggleSaved(id) {
  const nowSaved = !saved.has(id)
  if (nowSaved) saved.add(id)
  else saved.delete(id)
  emit()
  // Mirror the change to the server (best-effort). POST is idempotent and
  // DELETE of a missing row is a no-op, so this is safe to fire and forget.
  if (isApiConfigured) {
    const call = nowSaved
      ? api('/me/saved', { method: 'POST', body: { seriesId: id } })
      : api(`/me/saved/${encodeURIComponent(id)}`, { method: 'DELETE' })
    call.catch(() => {})
  }
}

export function savedCount() {
  return saved.size
}

// Pull the server's saves and merge with any local-only ones (uploading those
// so nothing is lost), then adopt the union. Called on sign-in.
async function syncFromServer() {
  if (!isApiConfigured) return
  try {
    const serverIds = await api('/me/saved')
    const server = new Set(serverIds)
    const localOnly = [...saved].filter((id) => !server.has(id))
    await Promise.all(
      localOnly.map((id) =>
        api('/me/saved', { method: 'POST', body: { seriesId: id } }).catch(() => {})
      )
    )
    saved = new Set([...server, ...localOnly])
    emit()
  } catch {
    // Backend unreachable — keep local state as-is.
  }
}

if (isApiConfigured) {
  // Sync on sign-in; reset to empty on sign-out so the next user starts clean
  // (their data reloads from the server when they sign back in).
  onAuthChange((session) => {
    if (session) syncFromServer()
    else {
      saved = new Set()
      emit()
    }
  })
  // Also sync once at startup in case a session is already restored.
  syncFromServer()
}

// Subscribe a component so it re-renders when saves change anywhere.
export function useSaved() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { isSaved, toggle: toggleSaved, count: saved.size }
}
