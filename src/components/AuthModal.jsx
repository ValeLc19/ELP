import { useState } from 'react'
import { useAuth } from '../lib/auth.js'
import { CATEGORY_ORDER, categoryColor, categoryTint } from '../data/categories.js'
import { ScanFaceIcon, CheckIcon, XIcon } from './icons.jsx'
import './AuthModal.css'

const INTERESTS = [
  ...CATEGORY_ORDER.map((c) => ({ label: c, color: categoryColor(c) })),
  { label: 'Free', color: '#e0a83e' },
  { label: 'Paid', color: '#2e8b57' },
  { label: 'Kids', color: '#d36fa6' },
  { label: '18+', color: '#e08a7b' },
]

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const pwOk = (v) => v.length >= 6

export default function AuthModal({ onClose, onSignedUp }) {
  const { logIn, signUp } = useAuth()
  const [view, setView] = useState('choice') // choice | login | signup

  // shared fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isBusiness, setIsBusiness] = useState(false)
  const [interests, setInterests] = useState([])
  const [error, setError] = useState('')

  const toggleInterest = (label) =>
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    )

  const doLogin = () => {
    const res = logIn(email.trim(), password)
    if (!res.ok) setError(res.error)
    else onClose()
  }

  const doSignup = () => {
    if (!emailOk(email) || !pwOk(password) || interests.length === 0) {
      setError('*Something is missing. Try again')
      return
    }
    const res = signUp({
      username: email.trim(),
      password,
      interests,
      isBusiness,
    })
    if (!res.ok) setError(res.error)
    else onSignedUp()
  }

  return (
    <div className="auth" role="dialog" aria-modal="true">
      <header className="auth__header">
        <h1 className="auth__logo">ELP</h1>
        <button className="auth__close" onClick={onClose} aria-label="Close">
          <XIcon />
        </button>
      </header>

      <div className="auth__body">
        <div className="auth__scan">
          <ScanFaceIcon width={64} height={64} />
        </div>

        {view === 'choice' && (
          <div className="auth__choice">
            <button className="auth__link" onClick={() => { setError(''); setView('login') }}>
              LOG IN
            </button>
            <button className="auth__link" onClick={() => { setError(''); setView('signup') }}>
              SIGN UP
            </button>
          </div>
        )}

        {view === 'login' && (
          <form
            className="auth__form"
            onSubmit={(e) => { e.preventDefault(); doLogin() }}
          >
            <h2 className="auth__title">LOG IN</h2>
            <label className="auth__label">Username:</label>
            <input
              className="auth__input"
              type="email"
              placeholder="user@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="auth__label">Password:</label>
            <input
              className="auth__input"
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="auth__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button type="submit" className="auth__done">Done</button>
            {error && <p className="auth__error auth__error--big">{error}</p>}
            <button type="button" className="auth__switch" onClick={() => { setError(''); setView('signup') }}>
              No account? Sign up
            </button>
          </form>
        )}

        {view === 'signup' && (
          <form
            className="auth__form"
            onSubmit={(e) => { e.preventDefault(); doSignup() }}
          >
            <h2 className="auth__title">SIGN UP</h2>
            <button
              type="button"
              className={`auth__business ${isBusiness ? 'is-on' : ''}`}
              onClick={() => setIsBusiness((b) => !b)}
            >
              Are you a business?{isBusiness ? ' ✓' : ''}
            </button>

            <label className="auth__label">Username</label>
            <div className="auth__field">
              <input
                className="auth__input"
                type="email"
                placeholder="user@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="auth__mark">
                {email && (emailOk(email)
                  ? <CheckIcon width={26} height={26} color="#6fae6f" />
                  : <XIcon width={24} height={24} color="#c0564a" />)}
              </span>
            </div>

            <label className="auth__label">Password</label>
            <div className="auth__field">
              <input
                className="auth__input"
                type="password"
                placeholder="*******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="auth__mark">
                {password && (pwOk(password)
                  ? <CheckIcon width={26} height={26} color="#6fae6f" />
                  : <XIcon width={24} height={24} color="#c0564a" />)}
              </span>
            </div>

            <h3 className="auth__interests-q">
              On what type of events are you interested?
            </h3>
            <div className="auth__interests">
              {INTERESTS.map((it) => {
                const on = interests.includes(it.label)
                return (
                  <button
                    type="button"
                    key={it.label}
                    className={`chip ${on ? 'is-on' : ''}`}
                    style={{
                      borderColor: it.color,
                      background: on ? categoryTintOr(it) : undefined,
                    }}
                    onClick={() => toggleInterest(it.label)}
                  >
                    <span className="badge__dot" style={{ background: it.color }} />
                    {it.label}
                  </button>
                )
              })}
            </div>

            {error && <p className="auth__error">{error}</p>}
            <button type="submit" className="auth__done">Done</button>
            <button type="button" className="auth__switch" onClick={() => { setError(''); setView('login') }}>
              Have an account? Log in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// Tint helper that also works for the non-category chips.
function categoryTintOr(it) {
  if (CATEGORY_ORDER.includes(it.label)) return categoryTint(it.label, 0.55)
  const h = it.color.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.55)`
}
