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
const newIds = new Set() // added during this session -> show a "New" badge
let seq = items.reduce((m, b) => Math.max(m, b.seq || 0), 0)
const listeners = new Set()
const emit = () => {
  localStorage.setItem(KEY, JSON.stringify(items))
  listeners.forEach((fn) => fn())
}

// Derive a display name + link from a handle or URL.
export function cleanName(raw) {
  let s = String(raw).trim()
  s = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  if (s.includes('/')) {
    const parts = s.split('/').filter(Boolean)
    s = parts[parts.length - 1]
  }
  s = s.replace(/^@/, '')
  return s || raw
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
  const name = cleanName(handle)
  if (items.some((b) => cleanName(b.handle).toLowerCase() === name.toLowerCase()))
    return
  seq += 1
  const b = { id: `biz-${seq}`, seq, handle, name, url: toUrl(handle) }
  items = [...items, b]
  newIds.add(b.id)
  emit()
}
export function removeBusiness(id) {
  items = items.filter((b) => b.id !== id)
  newIds.delete(id)
  emit()
}
export function isNewBusiness(id) {
  return newIds.has(id)
}

export function useBusinesses() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { items, add: addBusiness, remove: removeBusiness, isNew: isNewBusiness }
}
