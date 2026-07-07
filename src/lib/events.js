import { useEffect, useReducer } from 'react'
import { EVENTS } from '../data/events.js'

// The public event catalog. Local-first like the other libs, but PUBLIC — the
// events must load for signed-out visitors too, so this hits `GET /events`
// directly (no auth token) rather than the auth'd `api()` helper.
//
// The bundled static `EVENTS` is the instant first paint and the offline / no-
// backend fallback; a successful fetch replaces it with the live (visitelpaso-
// synced) catalog. Any failure keeps the static list, so the app never breaks.
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

// The backend serializes dateObj as an ISO *string*; the rest of the app needs a
// real Date for comparisons/sorting (see the same helper in userEvents.js).
function normalize(e) {
  const iso = e.dateISO || e.iso || ''
  const [y, m, d] = iso.split('-').map(Number)
  return { ...e, dateObj: new Date(y || 1970, (m || 1) - 1, d || 1) }
}

let events = EVENTS
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

async function loadFromServer() {
  if (!BASE) return // no backend configured -> keep the static catalog
  try {
    const res = await fetch(`${BASE}/events`)
    if (!res.ok) return
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length) {
      events = rows.map(normalize)
      emit()
    }
  } catch {
    /* offline / backend down — keep the static catalog */
  }
}

if (BASE) loadFromServer()

export function useEvents() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return events
}
