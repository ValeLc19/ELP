import { useEffect, useReducer } from 'react'

// Persisted set of saved event series ids (recurring instances share a save).
const KEY = 'elp-saved-events'

function read() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'))
  } catch {
    return new Set()
  }
}

let saved = read()
const listeners = new Set()

function emit() {
  localStorage.setItem(KEY, JSON.stringify([...saved]))
  listeners.forEach((fn) => fn())
}

export function isSaved(id) {
  return saved.has(id)
}

export function toggleSaved(id) {
  if (saved.has(id)) saved.delete(id)
  else saved.add(id)
  emit()
}

export function savedCount() {
  return saved.size
}

// Subscribe a component so it re-renders when saves change anywhere.
export function useSaved() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { isSaved, toggle: toggleSaved, count: saved.size }
}
