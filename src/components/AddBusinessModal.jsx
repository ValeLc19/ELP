import { useState } from 'react'
import { XIcon } from './icons.jsx'
import { useLang } from '../lib/i18n.js'
import './AddBusinessModal.css'

// Front-end stub: captures a business's social handle. Real pull-in of their
// posted events would need a backend integration.
export default function AddBusinessModal({ onClose }) {
  const { t } = useLang()
  const [handle, setHandle] = useState('')
  const [done, setDone] = useState(false)

  return (
    <div className="biz" role="dialog" aria-modal="true">
      <div className="biz__backdrop" onClick={onClose} />
      <div className="biz__card">
        <button className="biz__close" onClick={onClose} aria-label="Close">
          <XIcon />
        </button>
        {done ? (
          <>
            <h2 className="biz__title">{t('thanks')}</h2>
            <p className="biz__text">
              <strong>{handle}</strong>
            </p>
            <button className="biz__done" onClick={onClose}>{t('close')}</button>
          </>
        ) : (
          <>
            <h2 className="biz__title">{t('addBizTitle')}</h2>
            <p className="biz__text">{t('addBizText')}</p>
            <input
              className="biz__input"
              placeholder={t('addBizPlaceholder')}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
            <button
              className="biz__done"
              disabled={!handle.trim()}
              onClick={() => setDone(true)}
            >
              {t('add')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
