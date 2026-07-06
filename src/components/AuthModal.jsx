import { useState } from 'react'
import { useAuth, resendVerification, sendPasswordReset } from '../lib/auth.js'
import { useLang } from '../lib/i18n.js'
import { CATEGORY_ORDER, categoryColor, categoryTint } from '../data/categories.js'
import { ScanFaceIcon, XIcon, EyeIcon, EyeOffIcon } from './icons.jsx'
import './AuthModal.css'

// Animated circle marker: green circle+check when valid, red circle+X when not.
// Keyed by state so it re-draws its animation each time the state flips.
function AuthMark({ ok }) {
  const color = ok ? '#6fae6f' : '#c0564a'
  return (
    <svg className="authmark" viewBox="0 0 52 52" width="40" height="40">
      <circle
        className="authmark__circle"
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {ok ? (
        <path
          className="authmark__check"
          d="M15 27 l7 7 l15 -16"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path
            className="authmark__x authmark__x1"
            d="M19 19 L33 33"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            className="authmark__x authmark__x2"
            d="M33 19 L19 33"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

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
  const { t } = useLang()
  const [view, setView] = useState('choice') // choice | login | signup

  // shared fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [interests, setInterests] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resent, setResent] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const toggleInterest = (label) =>
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    )

  const doLogin = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    const res = await logIn(email.trim(), password)
    setBusy(false)
    if (res.ok) onClose()
    else setError(res.needsVerification ? t('errUnverified') : t('errWrong'))
  }

  const doSignup = async () => {
    if (busy) return
    if (!emailOk(email) || !pwOk(password) || interests.length === 0) {
      setError(t('errMissing'))
      return
    }
    setBusy(true)
    setError('')
    const res = await signUp({ username: email.trim(), password, interests })
    setBusy(false)
    if (res.ok && res.needsVerification) setView('verify')
    else if (res.ok) onSignedUp()
    else setError(res.exists ? t('accountExists') : res.error || t('errMissing'))
  }

  const doResend = async () => {
    await resendVerification(email.trim())
    setResent(true)
  }

  const doReset = async () => {
    if (busy) return
    if (!emailOk(email)) {
      setError(t('errMissing'))
      return
    }
    setBusy(true)
    setError('')
    await sendPasswordReset(email.trim())
    setBusy(false)
    setResetSent(true)
  }

  return (
    <div className="auth" role="dialog" aria-modal="true">
      <div className="auth__backdrop" onClick={onClose} />
      <div className={`auth__card auth__card--${view}`}>
        <button className="auth__close" onClick={onClose} aria-label="Close">
          <XIcon />
        </button>

        <div className="auth__scan">
          <ScanFaceIcon width={54} height={54} />
        </div>

        {view === 'choice' && (
          <div className="auth__choice">
            <button className="auth__link" onClick={() => { setError(''); setView('login') }}>
              {t('logIn')}
            </button>
            <button className="auth__link" onClick={() => { setError(''); setView('signup') }}>
              {t('signUp')}
            </button>
          </div>
        )}

        {view === 'login' && (
          <form
            className="auth__form"
            onSubmit={(e) => { e.preventDefault(); doLogin() }}
          >
            <h2 className="auth__title">{t('logIn')}</h2>
            <label className="auth__label">{t('emailLabelColon')}</label>
            <input
              className={`auth__input ${email && emailOk(email) ? 'auth__input--ok' : ''}`}
              type="email"
              placeholder="user@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="auth__label">{t('passwordLabelColon')}</label>
            <div className="auth__pw-wrap">
              <input
                className="auth__input"
                type={showPw ? 'text' : 'password'}
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth__eye"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                aria-pressed={showPw}
              >
                {showPw ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
              </button>
            </div>
            <label className="auth__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              {t('rememberMe')}
            </label>
            <button type="submit" className="auth__done" disabled={busy}>
              {busy ? t('working') : t('done')}
            </button>
            {error && <p className="auth__error auth__error--big">{error}</p>}
            <button type="button" className="auth__switch" onClick={() => { setError(''); setView('signup') }}>
              {t('noAccount')}
            </button>
            <button type="button" className="auth__switch" onClick={() => { setError(''); setResetSent(false); setView('forgot') }}>
              {t('forgotPassword')}
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form
            className="auth__form"
            onSubmit={(e) => { e.preventDefault(); doReset() }}
          >
            <h2 className="auth__title">{t('resetTitle')}</h2>
            {resetSent ? (
              <p className="auth__msg">{t('resetSent')}</p>
            ) : (
              <>
                <p className="auth__verify-text">{t('resetText')}</p>
                <label className="auth__label">{t('emailLabelColon')}</label>
                <input
                  className={`auth__input ${email && emailOk(email) ? 'auth__input--ok' : ''}`}
                  type="email"
                  placeholder="user@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="auth__error">{error}</p>}
                <button type="submit" className="auth__done" disabled={busy}>
                  {busy ? t('working') : t('sendReset')}
                </button>
              </>
            )}
            <button type="button" className="auth__switch" onClick={() => { setError(''); setResetSent(false); setView('login') }}>
              {t('backToLogin')}
            </button>
          </form>
        )}

        {view === 'signup' && (
          <form
            className="auth__form"
            onSubmit={(e) => { e.preventDefault(); doSignup() }}
          >
            <h2 className="auth__title">{t('signUp')}</h2>

            <label className="auth__label">{t('emailLabel')}</label>
            <div className="auth__field">
              <input
                className={`auth__input ${email && emailOk(email) ? 'auth__input--ok' : ''}`}
                type="email"
                placeholder="user@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="auth__mark">
                {email && (
                  <AuthMark key={emailOk(email) ? 'ok' : 'no'} ok={emailOk(email)} />
                )}
              </span>
            </div>

            <label className="auth__label">{t('passwordLabel')}</label>
            <div className="auth__field">
              <div className="auth__pw-wrap">
                <input
                  className="auth__input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="*******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth__eye"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  aria-pressed={showPw}
                >
                  {showPw ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                </button>
              </div>
              <span className="auth__mark">
                {password && (
                  <AuthMark key={pwOk(password) ? 'ok' : 'no'} ok={pwOk(password)} />
                )}
              </span>
            </div>

            <h3 className="auth__interests-q">{t('interestsQ')}</h3>
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
                    {CATEGORY_ORDER.includes(it.label)
                      ? t(`cat_${it.label}`)
                      : t(`chip_${it.label}`)}
                  </button>
                )
              })}
            </div>

            {error && <p className="auth__error">{error}</p>}
            <button type="submit" className="auth__done" disabled={busy}>
              {busy ? t('working') : t('done')}
            </button>
            <button type="button" className="auth__switch" onClick={() => { setError(''); setView('login') }}>
              {t('haveAccount')}
            </button>
          </form>
        )}

        {view === 'verify' && (
          <div className="auth__form auth__verify">
            <h2 className="auth__title">{t('verifyTitle')}</h2>
            <p className="auth__verify-text">{t('verifyText')}</p>
            <p className="auth__verify-email">{email}</p>
            {resent ? (
              <p className="auth__msg">{t('resendDone')}</p>
            ) : (
              <button type="button" className="auth__switch" onClick={doResend}>
                {t('resend')}
              </button>
            )}
            <button
              type="button"
              className="auth__done"
              onClick={() => { setError(''); setResent(false); setView('login') }}
            >
              {t('backToLogin')}
            </button>
          </div>
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
