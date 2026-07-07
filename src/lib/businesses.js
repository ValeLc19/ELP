import { useEffect, useReducer } from 'react'
import { isApiConfigured, api, onAuthChange } from './api.js'

// Persisted list of local-business accounts the user followed.
//
// Local-first (see saved.js for the same pattern): localStorage is the instant
// source of truth; when VITE_API_BASE is set and a real user is signed in, the
// list also syncs to `/me/businesses`. Each item carries an optional
// `serverId` (the backend row id) so it can be deleted server-side later. The
// name/avatar derivation below stays client-side — the server just persists
// the already-derived fields. Every server call is best-effort.
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

// A broad common-word dictionary used to segment run-together handles into a
// readable business name. Not exhaustive, but covers everyday English +
// common business/food/place vocabulary; unknown chunks are kept whole.
const WORD_LIST = `the and for you our your are all not our own new old big
little good great best more most love live life real true home town city local
here there this that with from into over under about house home place spot room
corner side street avenue road lane plaza park garden yard field farm ranch
orchard vineyard winery distillery cellar market mercado bazaar shop store
boutique goods gifts craft crafts makers works factory lab studio gallery museum
theatre theater stage sound music records vinyl books book paper press print ink
threads stitch vintage thrift closet salon spa gym club society union guild
collective company co inc group project exchange depot station company coffee
espresso latte mocha bean beans roast roasters brew brews brewery beer ale wine
juice smoothie tea kitchen grill grille bakery bake cafe cafeteria bistro deli
diner eatery tavern lounge pub bar cantina taco tacos taqueria burrito pizza
pizzeria burger burgers bbq smoke smokehouse fire roasted noodle ramen sushi
donut donuts bagel waffle pancake cupcake cookie cookies cake pie bread cheese
meat butcher fish seafood sweet sweets treat treats dessert candy chocolate
flower flowers floral bloom blooms petals candle candles soap salt stone clay
moon star stars sun sunset sunrise golden silver desert mountain mountains river
valley springs hill hills heights mesa canyon rio grande blue red green black
white gold rose wild urban rustic cozy artisan handmade family friends people
social night nights day days morning eats foods food bites nibbles snack fresh
farmers pantry table plate spoon fork cup mug pour drip barrel oak vine grape
yoga wellness fitness art arts studio dance ballet fit health mind body soul
paso texas nm corner downtown uptown east west north south central mission trail
casa la el los las san santa mi tu su good goods make made hand shop margin
notes brewing baking roasting catering trading clothing crossing landing lucky
cat dog bird fox owl bear wolf hound kitty pup chile chili salsa masa taqueria
panaderia mercado cocina bakes bakes threads studio market vintage`
  .split(/\s+/)
  .filter(Boolean)
const DICT = new Set(WORD_LIST)
const MAX_WORD = WORD_LIST.reduce((m, w) => Math.max(m, w.length), 0)

// Dynamic-programming word break: covers the string with dictionary words
// where possible (preferring longer/known words), keeping unknown runs whole.
function wordBreak(s) {
  const n = s.length
  const dp = new Array(n + 1).fill(null)
  dp[0] = { cost: 0, words: [] }
  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - Math.max(MAX_WORD, 12)); j < i; j++) {
      if (!dp[j]) continue
      const w = s.slice(j, i)
      const known = DICT.has(w)
      // known word: cheap; single-letter unknowns are almost forbidden; other
      // unknown chunks cost more with length so runs stay together
      const cost =
        dp[j].cost + (known ? 1 : w.length === 1 ? 5000 : 12 + w.length)
      if (!dp[i] || cost < dp[i].cost) dp[i] = { cost, words: [...dp[j].words, w] }
    }
  }
  return dp[n] ? dp[n].words : [s]
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
    words = wordBreak(separated.toLowerCase())
  }
  // drop trailing filler (co, tx, official, ...) for a cleaner, readable name
  const STRIP = new Set(['co', 'tx', 'nm', 'official', 'hq', 'inc', 'llc', 'ep', 'elp'])
  while (words.length > 1 && STRIP.has(words[words.length - 1].toLowerCase())) {
    words.pop()
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
function domainOf(raw) {
  const host = String(raw)
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
  return host.includes('.') && !host.startsWith('@') ? host.toLowerCase() : null
}
const SOCIAL_DOMAINS = ['instagram.', 'facebook.', 'fb.', 'twitter.', 'x.com', 'tiktok.']
const isSocialDomain = (d) => SOCIAL_DOMAINS.some((s) => d.includes(s))

// Optional unavatar Pro key (set VITE_UNAVATAR_KEY in a .env file). With it,
// Instagram/Twitter profile photos work; without it, those fall back to initials.
const UNAVATAR_KEY = import.meta.env.VITE_UNAVATAR_KEY || ''
const unavatar = (path) =>
  `https://unavatar.io/${path}?fallback=false${
    UNAVATAR_KEY ? `&apiKey=${UNAVATAR_KEY}` : ''
  }`

// Candidate profile/logo URLs to try in order; the card falls back to initials
// if all fail. Website links use the site's favicon/logo; social handles try
// unavatar (Instagram/Twitter need the Pro key above).
export function avatarCandidates(raw) {
  const name = cleanName(raw)
  const p = platformOf(raw)
  const domain = domainOf(raw)
  const urls = []
  if (p) urls.push(unavatar(`${p}/${name}`))
  if (domain && !isSocialDomain(domain)) {
    urls.push(unavatar(domain))
    urls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
  }
  urls.push(unavatar(name))
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
  const biz = {
    id: `biz-${seq}`,
    seq,
    handle,
    name,
    avatar: avatarUrl(handle),
    url: toUrl(handle),
    addedAt: Date.now(),
  }
  items = [...items, biz]
  emit()
  pushToServer(biz)
}
export function removeBusiness(id) {
  const target = items.find((b) => b.id === id)
  items = items.filter((b) => b.id !== id)
  emit()
  if (isApiConfigured && target && target.serverId != null) {
    api(`/me/businesses/${target.serverId}`, { method: 'DELETE' }).catch(() => {})
  }
}

// --- server sync (best-effort; no-ops when unconfigured / signed out) -------

function setServerId(localId, serverId) {
  items = items.map((b) => (b.id === localId ? { ...b, serverId } : b))
  emit()
}

// Create a business on the server and remember its row id for later deletes.
function pushToServer(biz) {
  if (!isApiConfigured || biz.serverId != null) return
  api('/me/businesses', {
    method: 'POST',
    body: { handle: biz.handle, name: biz.name, avatar: biz.avatar, url: biz.url },
  })
    .then((row) => {
      if (row && row.id != null) setServerId(biz.id, row.id)
    })
    .catch(() => {}) // 409 duplicate / offline / signed out — keep local.
}

// Pull the server's list, adopt rows we don't have (matched by name), tag
// local rows with their serverId, and upload any the server is missing.
async function syncFromServer() {
  if (!isApiConfigured) return
  try {
    const server = await api('/me/businesses')
    const localNames = new Set(items.map((b) => b.name.toLowerCase()))
    const adopted = server
      .filter((s) => !localNames.has(s.name.toLowerCase()))
      .map((s) => {
        seq += 1
        return {
          id: `biz-${seq}`,
          seq,
          serverId: s.id,
          handle: s.handle,
          name: s.name,
          avatar: s.avatar || avatarUrl(s.handle),
          url: s.url || toUrl(s.handle),
          addedAt: Date.now(),
        }
      })
    const serverByName = new Map(server.map((s) => [s.name.toLowerCase(), s]))
    items = [...items, ...adopted].map((b) => {
      const match = serverByName.get(b.name.toLowerCase())
      return match ? { ...b, serverId: match.id } : b
    })
    emit()
    items.filter((b) => b.serverId == null).forEach(pushToServer)
  } catch {
    // Backend unreachable — keep local state.
  }
}

if (isApiConfigured) {
  onAuthChange((session) => {
    if (session) syncFromServer()
    else {
      items = []
      emit()
    }
  })
  syncFromServer()
}

export function useBusinesses() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { items, add: addBusiness, remove: removeBusiness }
}
