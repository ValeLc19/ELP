// Enrich src/data/events.js with real visitelpaso.com event links.
//
// Stage-1 of the "keep general events fresh" plan (see the deferred auto-sync):
// visitelpaso publishes a sitemap of every event URL, and each event page is
// server-rendered with JSON-LD `@type:Event` data — so no headless scraping is
// needed. This script is the reusable ingestion primitive:
//   1. fetch the sitemap -> every /events/<slug> URL
//   2. match each of our events to a page (canonical or nearest-upcoming, never
//      a past occurrence) and VERIFY by comparing the page's JSON-LD event name
//   3. write the matched URL into each event's empty `sourceUrl`
//
// Only high-confidence, content-verified matches are written; the rest keep the
// in-app "Search Google" fallback. Re-run any time to refresh:
//   node scripts/enrich-sourceurls.mjs           # apply
//   node scripts/enrich-sourceurls.mjs --dry     # report only, no writes
//
// robots.txt allows this (sitemap published, /events not disallowed, crawlers
// permitted). Be polite: the loop throttles between requests.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const EVENTS_PATH = resolve(HERE, '../src/data/events.js')
const SITEMAP = 'https://visitelpaso.com/sitemap.xml'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122 Safari/537.36'
const TODAY = new Date().toISOString().slice(0, 10)
const DRY = process.argv.includes('--dry')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const cleanBase = (slug) => slug.replace(/^\d+-/, '').replace(/-\d{4}-\d{2}-\d{2}$/, '')
const dateOf = (slug) => (slug.match(/-(\d{4}-\d{2}-\d{2})$/) || [])[1] || null
const tokens = (s) => new Set(slugify(s).split('-').filter((w) => w.length > 2))
const jaccard = (a, b) => {
  const A = tokens(a), B = tokens(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / (A.size + B.size - inter)
}

async function fetchName(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
    if (!res.ok) return null
    const html = await res.text()
    const ld = html.match(/"@type"\s*:\s*"Event"[\s\S]{0,600}?"name"\s*:\s*"([^"]+)"/i)
      || html.match(/"name"\s*:\s*"([^"]+)"[\s\S]{0,600}?"@type"\s*:\s*"Event"/i)
    if (ld) return ld[1]
    const og = html.match(/<meta property="og:title" content="([^"]+)"/i)
    return og ? og[1].replace(/\s*[-|]\s*Visit El Paso.*$/i, '').trim() : null
  } catch {
    return null
  }
}

async function main() {
  const { EVENTS } = await import(EVENTS_PATH)
  const seen = new Set()
  const ours = []
  for (const e of EVENTS) {
    const key = e.seriesId || e.id
    if (seen.has(key)) continue
    seen.add(key)
    ours.push({ id: key, title: e.title })
  }

  const xml = await (await fetch(SITEMAP, { headers: { 'User-Agent': UA } })).text()
  const urls = [...new Set((xml.match(/https:\/\/visitelpaso\.com\/events\/[a-z0-9][a-z0-9-]+/g) || []))]
  const idx = urls.map((u) => {
    const slug = u.split('/events/')[1]
    return { url: u, slug, base: cleanBase(slug), date: dateOf(slug), canonical: !/-\d{4}-\d{2}-\d{2}$/.test(slug) && !/^\d+-/.test(slug) }
  })

  const map = new Map()
  for (const ev of ours) {
    const nt = slugify(ev.title)
    const ranked = idx
      .map((c) => {
        let score = c.base === nt ? 1 : (c.base.startsWith(nt) || nt.startsWith(c.base)) ? 0.85
          : (c.base.includes(nt) || nt.includes(c.base)) ? 0.7 : jaccard(ev.title, c.base)
        return { ...c, score }
      })
      .filter((c) => c.score >= 0.55)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        if (a.canonical !== b.canonical) return a.canonical ? -1 : 1
        const af = a.date && a.date >= TODAY, bf = b.date && b.date >= TODAY
        if (af && bf) return a.date < b.date ? -1 : 1
        if (af !== bf) return af ? -1 : 1
        return (b.date || '') < (a.date || '') ? -1 : 1
      })
      .slice(0, 3)

    for (const c of ranked) {
      if (c.date && c.date < TODAY && !c.canonical) continue
      const name = await fetchName(c.url)
      await sleep(350)
      if (!name) continue
      const sn = slugify(name)
      if (jaccard(ev.title, name) >= 0.6 || sn === nt || sn.includes(nt) || nt.includes(sn)) {
        map.set(ev.id, c.url)
        break
      }
    }
    console.error(`${map.has(ev.id) ? 'OK  ' : 'MISS'} ${ev.title}`)
  }

  console.error(`\nmatched ${map.size}/${ours.length}`)
  if (DRY) return

  const lines = readFileSync(EVENTS_PATH, 'utf8').split('\n')
  let curId = null, applied = 0
  const out = lines.map((line) => {
    const m = line.match(/^\s*id: '([^']+)',/)
    if (m) { curId = m[1]; return line }
    if (/^\s*sourceUrl: '',?\s*$/.test(line) && curId && map.has(curId)) {
      const url = map.get(curId); map.delete(curId); applied++
      return line.replace(/sourceUrl: ''/, `sourceUrl: '${url}'`)
    }
    return line
  })
  writeFileSync(EVENTS_PATH, out.join('\n'))
  console.error(`wrote ${applied} sourceUrls`)
}

main()
