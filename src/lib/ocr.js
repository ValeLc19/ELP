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

const pad = (n) => String(n).padStart(2, '0')
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
function fmtTime(d) {
  let h = d.getHours()
  const m = pad(d.getMinutes())
  const ampm = h < 12 ? 'am' : 'pm'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

// Extract { dateISO, time, price, address } from free text (OCR + caption).
// Only returns the fields it can confidently find.
export function parseEventText(text) {
  const out = {}
  if (!text) return out

  // Date / time — chrono, biased toward upcoming dates.
  try {
    const results = chrono.parse(text, new Date(), { forwardDate: true })
    const best =
      results.find((r) => r.start && r.start.isCertain('day')) || results[0]
    if (best && best.start) {
      const d = best.start.date()
      out.dateISO = isoOf(d)
      if (best.start.isCertain('hour')) out.time = fmtTime(d)
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
