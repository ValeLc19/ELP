import { useState } from 'react'
import { changePassword, clearRecovery } from '../lib/auth.js'
import { useLang } from '../lib/i18n.js'
import { EyeIcon, EyeOffIcon } from './icons.jsx'
import './AuthModal.css'

// Shown when the user arrives from a password-reset email (recovery mode).
// They set a new password; on success they're left logged in.
export default function ResetPasswordModal() {
  const { t } = useLang()
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const save = async () => {
    if (busy) return
    if (pw.length < 6) {
      setErr(t('pwTooShort'))
      return
    }
    setBusy(true)
    setErr('')
    const res = await changePassword(pw)
    setBusy(false)
    if (!res.ok) {
      setErr(res.error || t('errWrong'))
      return
    }
    setDone(true)
  }

  return (
    <div className="auth" role="dialog" aria-modal="true">
      <div className="auth__backdrop" />
      <div className="auth__card auth__card--login">
        {done ? (
          <div className="auth__form auth__verify">
            <h2 className="auth__title">{t('resetDone')}</h2>
            <button type="button" className="auth__done" onClick={clearRecovery}>
              {t('gotIt')}
            </button>
          </div>
        ) : (
          <form className="auth__form" onSubmit={(e) => { e.preventDefault(); save() }}>
            <h2 className="auth__title">{t('setNewPasswordTitle')}</h2>
            <p className="auth__verify-text">{t('setNewPasswordText')}</p>
            <label className="auth__label">{t('newPassword')}</label>
            <div className="auth__pw-wrap">
              <input
                className="auth__input"
                type={showPw ? 'text' : 'password'}
                placeholder="**********"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
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
            {err && <p className="auth__error">{err}</p>}
            <button type="submit" className="auth__done" disabled={busy}>
              {busy ? t('working') : t('save')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
