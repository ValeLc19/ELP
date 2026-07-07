import { useEffect, useReducer } from 'react'
import { isApiConfigured, api, onAuthChange } from './api.js'

// Events the user added themselves (paste-a-link flow), stored per-user on the
// backend. The API returns them already in the frontend event shape (id
// "uev-N", fromBusiness: true, derived date fields), so we hold them as-is.
// Requires a real signed-in account + backend; demo/anon users get an empty
// list (the feature is account-only, like saved events).

let events = []
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

export function getUserEvents() {
  return events
}

// Best-effort autofill from a pasted link. Never throws — returns whatever the
// backend could read (possibly just { sourceUrl }) so the form still opens.
export async function extractLink(url) {
  const clean = String(url || '').trim()
  if (!clean) return {}
  if (!isApiConfigured) return { sourceUrl: clean }
  try {
    return (await api('/pipeline/extract', { method: 'POST', body: { url: clean } })) || {}
  } catch {
    return { sourceUrl: clean }
  }
}

export async function addUserEvent(data) {
  if (!isApiConfigured) return { ok: false, error: 'Sign in to add events.' }
  try {
    const row = await api('/me/events', { method: 'POST', body: data })
    if (row) {
      events = [...events, row]
      emit()
    }
    return { ok: true, event: row }
  } catch {
    return { ok: false, error: 'Could not save the event. Try again.' }
  }
}

export function removeUserEvent(id) {
  const target = events.find((e) => e.id === id)
  events = events.filter((e) => e.id !== id)
  emit()
  if (isApiConfigured && target) {
    const numId = String(target.id).replace(/^uev-/, '')
    api(`/me/events/${numId}`, { method: 'DELETE' }).catch(() => {})
  }
}

async function syncFromServer() {
  if (!isApiConfigured) return
  try {
    events = (await api('/me/events')) || []
    emit()
  } catch {
    /* backend unreachable — keep what we have */
  }
}

if (isApiConfigured) {
  onAuthChange((session) => {
    if (session) syncFromServer()
    else {
      events = []
      emit()
    }
  })
  syncFromServer()
}

export function useUserEvents() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return events
}
