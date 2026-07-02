import { useState } from 'react'
import { useAuth, changePassword } from '../lib/auth.js'
import { useLang } from '../lib/i18n.js'
import { XIcon } from './icons.jsx'
import './AccountModal.css'

export default function AccountModal({ onClose, onLogout }) {
  const { user } = useAuth()
  const { t } = useLang()
  const [changing, setChanging] = useState(false)
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  if (!user) return null

  const save = () => {
    if (pw.length < 6) {
      setErr(t('pwTooShort'))
      return
    }
    changePassword(pw)
    setChanging(false)
    setPw('')
    setErr('')
    setMsg(t('passwordChanged'))
  }

  return (
    <div className="acct" role="dialog" aria-modal="true">
      <div className="acct__backdrop" onClick={onClose} />
      <div className="acct__card">
        <button className="acct__close" onClick={onClose} aria-label={t('close')}>
          <XIcon />
        </button>
        <h2 className="acct__title">{t('account')}</h2>

        <label className="acct__label">{t('emailLabel')}</label>
        <div className="acct__value">{user.username}</div>

        <label className="acct__label">{t('passwordLabel')}</label>
        {!changing ? (
          <div className="acct__pw-row">
            <span className="acct__value">••••••••</span>
            <button
              type="button"
              className="acct__link"
              onClick={() => {
                setChanging(true)
                setMsg('')
              }}
            >
              {t('changePassword')}
            </button>
          </div>
        ) : (
          <div className="acct__change">
            <input
              className="acct__input"
              type="password"
              placeholder={t('newPassword')}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button type="button" className="acct__save" onClick={save}>
              {t('save')}
            </button>
          </div>
        )}
        {err && <p className="acct__err">{err}</p>}
        {msg && <p className="acct__msg">{msg}</p>}

        <button className="acct__logout" onClick={onLogout}>
          {t('logOut')}
        </button>
      </div>
    </div>
  )
}
