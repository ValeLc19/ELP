import { useEffect, useReducer } from 'react'

// Persisted list of local-business accounts the user added (front-end mock).
const KEY = 'elp-businesses'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

let items = read()
let seq = items.reduce((m, b) => Math.max(m, b.seq || 0), 0)
const listeners = new Set()
const emit = () => {
  localStorage.setItem(KEY, JSON.stringify(items))
  listeners.forEach((fn) => fn())
}

// --- deriving name / avatar / link from a handle or URL -------------------
export function cleanName(raw) {
  let s = String(raw).trim()
  s = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  if (s.includes('/')) {
    const parts = s.split('/').filter(Boolean)
    s = parts[parts.length - 1]
  }
  return s.replace(/^@/, '') || String(raw)
}

// Small word list to split run-together handles into a business-style name.
const WORDS = [
  'breakroom', 'coffee', 'book', 'books', 'bar', 'notes', 'margin', 'sassy',
  'sips', 'sunset', 'heights', 'market', 'house', 'kitchen', 'brewery', 'wine',
  'club', 'shop', 'studio', 'gallery', 'museum', 'theatre', 'theater', 'bakery',
  'cafe', 'grill', 'tavern', 'lounge', 'roasters', 'records', 'vintage',
  'collective', 'company', 'co', 'and', 'the', 'el', 'paso', 'city', 'local',
  'craft', 'goods', 'makers', 'yoga', 'art', 'arts', 'music', 'sound', 'stage',
  'park', 'garden', 'plaza', 'trail', 'mission', 'downtown', 'social', 'street',
  'tx', 'nm', 'eats', 'foods', 'events', 'live', 'night', 'nights', 'sun', 'sips',
  'bites', 'brew', 'brews', 'beer', 'ale', 'house', 'juice', 'tea', 'sweet',
  'sweets', 'treats', 'dessert', 'taco', 'tacos', 'pizza', 'burger', 'burgers',
  'bbq', 'smoke', 'fire', 'roast', 'bean', 'beans', 'bloom', 'petals', 'flower',
  'flowers', 'threads', 'stitch', 'ink', 'press', 'print', 'paper', 'candle',
  'candles', 'soap', 'salt', 'stone', 'clay', 'moon', 'star', 'stars', 'desert',
  'cactus', 'agave', 'chile', 'chili', 'salsa', 'masa', 'panaderia', 'mercado',
  'cocina', 'good', 'goods', 'little', 'big', 'old', 'new', 'west', 'east',
]

function greedySplit(token) {
  const out = []
  let i = 0
  while (i < token.length) {
    let match = ''
    for (const w of WORDS) {
      if (w.length > match.length && token.startsWith(w, i)) match = w
    }
    if (!match) return null // couldn't cover it cleanly
    out.push(match)
    i += match.length
  }
  return out
}

export function prettifyName(raw) {
  const base = cleanName(raw)
  const separated = base
    .replace(/[_.\-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .trim()
  let words
  if (separated.includes(' ')) {
    words = separated.split(/\s+/)
  } else {
    words = greedySplit(separated.toLowerCase()) || [separated]
  }
  const name = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return name || base
}

function platformOf(raw) {
  const s = String(raw).toLowerCase()
  if (s.includes('instagram')) return 'instagram'
  if (s.includes('facebook')) return 'facebook'
  if (s.includes('tiktok')) return 'tiktok'
  if (s.includes('twitter') || s.includes('x.com')) return 'twitter'
  return null
}
// Candidate profile-photo URLs to try in order (real photo first, then a
// broader lookup); the card falls back to initials if all fail.
export function avatarCandidates(raw) {
  const name = cleanName(raw)
  const p = platformOf(raw)
  const urls = []
  if (p) urls.push(`https://unavatar.io/${p}/${name}?fallback=false`)
  urls.push(`https://unavatar.io/${name}?fallback=false`)
  return urls
}
function avatarUrl(raw) {
  return avatarCandidates(raw)[0]
}
function toUrl(raw) {
  const s = String(raw).trim()
  if (/^https?:\/\//i.test(s)) return s
  if (s.includes('.') && s.includes('/')) return `https://${s}`
  return `https://www.instagram.com/${cleanName(s)}`
}

export function addBusiness(raw) {
  const handle = String(raw).trim()
  if (!handle) return
  const name = prettifyName(handle)
  if (items.some((b) => b.name.toLowerCase() === name.toLowerCase())) return
  seq += 1
  items = [
    ...items,
    {
      id: `biz-${seq}`,
      seq,
      handle,
      name,
      avatar: avatarUrl(handle),
      url: toUrl(handle),
      addedAt: Date.now(),
    },
  ]
  emit()
}
export function removeBusiness(id) {
  items = items.filter((b) => b.id !== id)
  emit()
}

export function useBusinesses() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { items, add: addBusiness, remove: removeBusiness }
}
