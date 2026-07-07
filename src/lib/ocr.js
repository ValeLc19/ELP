import { createWorker } from 'tesseract.js'
import * as chrono from 'chrono-node'

// Free, no-key flyer reading: OCR the image in the browser (Tesseract.js), then
// pull date/time/price/place out of the OCR text + caption with chrono-node +
// regex. Best-effort — the user reviews and fixes in the form before saving.

// One shared worker, created on first use. Tesseract downloads its wasm/core +
// English model from a CDN on first run (a few MB, then cached by the browser).
let workerPromise = null
async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng').catch((e) => {
      workerPromise = null // let a later attempt retry
      throw e
    })
  }
  return workerPromise
}

// Read an uploaded image file into a downscaled JPEG data URL — small enough
// to store as the event image, still big enough for OCR to read the flyer.
export function imageFileToDataUrl(file, maxDim = 1100) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read failed'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('decode failed'))
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// OCR an image data URL. Returns the recognized text, or '' on any failure.
export async function ocrImage(dataUrl) {
  if (!dataUrl) return ''
  try {
    const worker = await getWorker()
    const { data } = await worker.recognize(dataUrl)
    return (data && data.text) || ''
  } catch {
    return ''
  }
}

// Guess an event category from any text (business name + title + OCR + caption).
// Returns one of the app's categories, or null if nothing matches (keep default).
const CAT_RULES = [
  ['Food', /coffee|matcha|\btea\b|caf[eé]|bakery|kitchen|grill|bbq|taco|pizza|\bfood\b|brunch|dinner|brew|beer|wine|juice|smoothie|dessert|sweet|donut|deli|diner|\bbar\b|\bsip\b|drink/i],
  ['Arts', /\bbook|\bart\b|gallery|studio|paint|craft|museum|theat|\bpress\b|\bprint|pottery|ceramic|maker/i],
  ['Music', /music|record|\bsound\b|\bdj\b|\bband\b|vinyl|\bstage\b|concert|jazz|karaoke/i],
  ['Sports', /yoga|\bgym\b|\bfit|\brun\b|sport|climb|\bbike\b|workout|pilates|dance|zumba/i],
  ['Outdoors', /\bpark\b|garden|\bhike|\btrail\b|outdoor|nature|\bcamp/i],
  ['Markets', /market|pop-?up|vendor|bazaar|\bfair\b|flea|\bsale\b/i],
]
export function guessCategory(text) {
  const s = String(text || '')
  for (const [cat, re] of CAT_RULES) if (re.test(s)) return cat
  return null
}

const pad = (n) => String(n).padStart(2, '0')
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
function fmtTime(d) {
  let h = d.getHours()
  const m = pad(d.getMinutes())
  const ampm = h < 12 ? 'am' : 'pm'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

// Extract { dateISO, time, price, address, dates } from free text (OCR +
// caption). `dates` is every distinct date found (for flyers that list a few);
// dateISO/time mirror the first one. Only returns what it can confidently find.
export function parseEventText(text) {
  const out = { dates: [] }
  if (!text) return out

  // Date / time. Parse literally (current year for bare dates). If a date with
  // no stated year lands well in the past (~2+ months), it's probably meant for
  // next year, so bump it; a *recently* passed date stays put so the app can
  // still flag it as past. Collect all distinct dates.
  try {
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - 60)
    const results = chrono.parse(text, now)
    const seen = new Set()
    for (const r of results) {
      if (!r.start || !r.start.isCertain('day')) continue
      let d = r.start.date()
      if (!r.start.isCertain('year') && d < cutoff) {
        d = new Date(d)
        d.setFullYear(d.getFullYear() + 1)
      }
      const iso = isoOf(d)
      if (seen.has(iso)) continue
      seen.add(iso)
      out.dates.push({ dateISO: iso, time: r.start.isCertain('hour') ? fmtTime(d) : '' })
    }
    // Fallback: nothing had a certain day — take the first parse if any.
    if (!out.dates.length && results[0] && results[0].start) {
      const d = results[0].start.date()
      out.dates.push({
        dateISO: isoOf(d),
        time: results[0].start.isCertain('hour') ? fmtTime(d) : '',
      })
    }
    if (out.dates.length) {
      out.dateISO = out.dates[0].dateISO
      if (out.dates[0].time) out.time = out.dates[0].time
    }
  } catch {
    /* chrono failed on this text — skip date */
  }

  // Price
  if (/\bfree\b/i.test(text)) {
    out.price = 'Free'
  } else {
    const pm = text.match(/\$\s?(\d{1,4}(?:\.\d{2})?)/)
    if (pm) out.price = `$${pm[1]}`
  }

  // Address — best-effort US street pattern (e.g. "2260 N Zaragoza Rd").
  const am = text.match(
    /\b\d{2,6}\s+(?:[NSEW]\.?\s+)?[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,3}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Dr|Drive|Ln|Lane|Way|Cir|Circle|Pkwy|Ct|Court|Plaza|Pl|Loop|Trail)\b\.?/i
  )
  if (am) out.address = am[0].replace(/\s+/g, ' ').trim()

  return out
}
