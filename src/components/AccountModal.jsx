import { useState } from 'react'
import { useAuth, changePassword } from '../lib/auth.js'
import { useLang } from '../lib/i18n.js'
import { XIcon, UserIcon, ShopIcon, LogOutIcon } from './icons.jsx'
import './AccountModal.css'

export default function AccountModal({ onClose, onLogout, onBusinesses }) {
  const { user } = useAuth()
  const { t } = useLang()
  const [infoOpen, setInfoOpen] = useState(false)
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

        <div className="acct__menu">
          {/* 1 — Account information (expands) */}
          <button
            className="acct__row"
            aria-expanded={infoOpen}
            onClick={() => {
              setInfoOpen((o) => !o)
              setMsg('')
            }}
          >
            <span className="acct__row-icon">
              <UserIcon width={22} height={22} />
            </span>
            <span className="acct__row-label">{t('accountInfo')}</span>
            <span className={`acct__chev ${infoOpen ? 'is-open' : ''}`}>›</span>
          </button>
          {infoOpen && (
            <div className="acct__panel">
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
            </div>
          )}

          {/* 2 — My Local Business (navigates) */}
          <button className="acct__row" onClick={onBusinesses}>
            <span className="acct__row-icon">
              <ShopIcon width={22} height={22} />
            </span>
            <span className="acct__row-label">{t('myBusinesses')}</span>
            <span className="acct__chev">›</span>
          </button>

          {/* 3 — Log out */}
          <button className="acct__row acct__row--logout" onClick={onLogout}>
            <span className="acct__row-icon">
              <LogOutIcon width={22} height={22} />
            </span>
            <span className="acct__row-label">{t('logOut')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
