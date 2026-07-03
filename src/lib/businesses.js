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

// ---- Mock "events pulled from a business's social" (prototype) -------------
// Stands in for the real pipeline (scrape posts -> vision-extract -> geocode).
// Same shape as the app's event instances, tagged with fromBusiness.
const STOCK = (id) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`
const CAT_IMG = {
  Food: '1414235077428-338989a2e8c0',
  Arts: '1531058020387-3be344556be6',
  Markets: '1488459716781-31db52582fe9',
  Music: '1501386761578-eac5c94b800a',
  Sports: '1506126613408-eca07ce68773',
  Outdoors: '1551632811-561732d1e306',
}
const ADDRS = [
  { a: '2260 N Zaragoza Rd, El Paso, TX', lat: 31.744, lng: -106.303 },
  { a: '500 N Oregon St, El Paso, TX', lat: 31.7597, lng: -106.4877 },
  { a: '3100 N Mesa St, El Paso, TX', lat: 31.795, lng: -106.505 },
  { a: '1201 N Cotton St, El Paso, TX', lat: 31.774, lng: -106.472 },
  { a: '7400 Remcon Cir, El Paso, TX', lat: 31.833, lng: -106.545 },
]
const TITLES = ['Pop-Up', 'Event Night', 'Open House', 'Market Day', 'Live Session']
const TIMES = ['12:00 pm', '6:00 pm', '5:00 pm', '7:00 pm', '10:00 am']
const PRICES = ['Free', 'Free', '$5', '$10', 'Free']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function guessCategory(name) {
  const s = name.toLowerCase()
  if (/coffee|matcha|tea|cafe|bakery|kitchen|grill|bbq|taco|pizza|food|eat|brew|wine|juice|dessert|sweet|donut|deli|diner|bar/.test(s)) return 'Food'
  if (/book|art|gallery|studio|paint|craft|museum|theat|press|print/.test(s)) return 'Arts'
  if (/music|record|sound|dj|band|vinyl|stage/.test(s)) return 'Music'
  if (/yoga|gym|fit|run|sport|climb|bike/.test(s)) return 'Sports'
  if (/park|garden|hike|trail|outdoor/.test(s)) return 'Outdoors'
  return 'Markets'
}

export function businessEvents(items) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return items.map((b, idx) => {
    const seq = b.seq || idx + 1
    const cat = guessCategory(b.name)
    const addr = ADDRS[seq % ADDRS.length]
    const d = new Date(today)
    d.setDate(today.getDate() + 7 + ((seq * 4) % 40))
    const iso = isoOf(d)
    return {
      id: `bizev-${b.id}`,
      seriesId: `bizev-${b.id}`,
      fromBusiness: true,
      businessId: b.id,
      businessName: b.name,
      businessAvatar: b.avatar,
      title: `${b.name} ${TITLES[seq % TITLES.length]}`,
      short: b.name,
      category: cat,
      image: STOCK(CAT_IMG[cat]),
      family: true,
      address: addr.a,
      lat: addr.lat + (seq % 3) * 0.004,
      lng: addr.lng + (seq % 2) * 0.004,
      dateISO: iso,
      dateObj: d,
      iso,
      day: d.getDate(),
      date: `${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}`,
      time: TIMES[seq % TIMES.length],
      price: PRICES[seq % PRICES.length],
      about: `A pop-up from ${b.name} — details pulled from their latest social post. Come by and say hi!`,
      additionalInfo: 'Detected from their post.',
      host: b.name,
      recurLabel: null,
      sourceUrl: b.url,
    }
  })
}

export function useBusinesses() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { items, add: addBusiness, remove: removeBusiness }
}
