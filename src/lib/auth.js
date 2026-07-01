import { useEffect, useReducer } from 'react'

// NOTE: front-end mock only. Accounts live in localStorage in plain text —
// this is a UI prototype, not real authentication. Don't use real passwords.
const USERS = 'elp-users'
const CUR = 'elp-current-user'

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS) || '[]')
  } catch {
    return []
  }
}
function writeUsers(u) {
  localStorage.setItem(USERS, JSON.stringify(u))
}

let current = localStorage.getItem(CUR) || null
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

export function getUser() {
  if (!current) return null
  return readUsers().find((u) => u.username === current) || null
}

export function signUp({ username, password, interests, isBusiness }) {
  const users = readUsers()
  if (users.some((u) => u.username === username)) {
    return { ok: false, error: 'That account already exists. Try logging in.' }
  }
  users.push({
    username,
    password,
    interests: interests || [],
    isBusiness: !!isBusiness,
  })
  writeUsers(users)
  current = username
  localStorage.setItem(CUR, current)
  emit()
  return { ok: true, firstTime: true }
}

export function logIn(username, password) {
  const user = readUsers().find((u) => u.username === username)
  if (!user || user.password !== password) {
    return { ok: false, error: 'Something is Wrong. Try Again' }
  }
  current = username
  localStorage.setItem(CUR, current)
  emit()
  return { ok: true }
}

export function logOut() {
  current = null
  localStorage.removeItem(CUR)
  emit()
}

// Preview helper: sign in as a demo account (used by ?demo=1).
export function demoSignIn() {
  const users = readUsers()
  if (!users.some((u) => u.username === 'demo@elp.com')) {
    users.push({
      username: 'demo@elp.com',
      password: 'demo123',
      interests: ['Music', 'Outdoors', 'Food'],
    })
    writeUsers(users)
  }
  current = 'demo@elp.com'
  localStorage.setItem(CUR, current)
  emit()
}

// A short display name from the email/username (e.g. user@mail.com -> user).
export function displayName(user) {
  if (!user) return ''
  return user.username.split('@')[0]
}

export function useAuth() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { user: getUser(), signUp, logIn, logOut }
}
