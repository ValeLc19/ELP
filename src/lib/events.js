import { useEffect, useReducer } from 'react'
import { EVENTS, cleanTitle } from '../data/events.js'

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
// Titles are cleaned here too, so rows synced before the ingest-side cleanup
// still render tidily.
function normalize(e) {
  const iso = e.dateISO || e.iso || ''
  const [y, m, d] = iso.split('-').map(Number)
  return { ...e, title: cleanTitle(e.title), dateObj: new Date(y || 1970, (m || 1) - 1, d || 1) }
}

// Cache of the last successful fetch. Without it the first paint shows the
// frozen static bundle — a *different* catalog (152 curated events, all with a
// price) which then swaps for the live one (250 events, 12% priced). On a cold
// Render dyno that swap can land 30-60s in, so the visible content changed
// under the user. Painting the last real catalog makes the swap a no-op.
const CACHE_KEY = 'elp-events-cache'

function readCache() {
  try {
    const rows = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    return Array.isArray(rows) && rows.length ? rows.map(normalize) : null
  } catch {
    return null
  }
}
function writeCache(rows) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
  } catch {
    /* quota / private mode — the cache is an optimisation, never required */
  }
}

// Static bundle is now only the cold-start / offline fallback.
let events = readCache() || EVENTS
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
      writeCache(rows)
      emit()
    }
  } catch {
    /* offline / backend down — keep whatever we painted */
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
