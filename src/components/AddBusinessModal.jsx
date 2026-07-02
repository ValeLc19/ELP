import { useRef, useState } from 'react'
import { XIcon, CheckIcon } from './icons.jsx'
import { useLang } from '../lib/i18n.js'
import './AddBusinessModal.css'

// Front-end stub: collects a business's social handles and simulates verifying
// each one. Real pull-in of their posted events would need a backend.
let uid = 0

export default function AddBusinessModal({ onClose }) {
  const { t } = useLang()
  const [fields, setFields] = useState([{ id: ++uid, value: '', status: 'empty' }])
  const timers = useRef({})

  const update = (id, value) => {
    setFields((fs) =>
      fs.map((f) =>
        f.id === id
          ? { ...f, value, status: value.trim() ? 'verifying' : 'empty' }
          : f
      )
    )
    clearTimeout(timers.current[id])
    if (value.trim()) {
      // simulate verifying the link + fetching the account's info
      timers.current[id] = setTimeout(() => {
        setFields((fs) =>
          fs.map((f) => (f.id === id ? { ...f, status: 'verified' } : f))
        )
      }, 1400)
    }
  }

  const addField = () =>
    setFields((fs) => [...fs, { id: ++uid, value: '', status: 'empty' }])

  return (
    <div className="biz" role="dialog" aria-modal="true">
      <div className="biz__backdrop" onClick={onClose} />
      <div className="biz__card">
        <button className="biz__close" onClick={onClose} aria-label={t('close')}>
          <XIcon />
        </button>
        <h2 className="biz__title">{t('onb1')}</h2>

        {fields.map((f) => (
          <div className="biz__field" key={f.id}>
            <div className="biz__row">
              <input
                className="biz__input"
                placeholder="@profile"
                value={f.value}
                onChange={(e) => update(f.id, e.target.value)}
              />
              <span className="biz__status" aria-hidden="true">
                {f.status === 'verifying' && <span className="biz__spinner" />}
                {f.status === 'verified' && (
                  <CheckIcon width={20} height={20} color="#6fae6f" />
                )}
              </span>
            </div>
            <button type="button" className="biz__addmore" onClick={addField}>
              {t('addMore')} +
            </button>
          </div>
        ))}

        <button className="biz__done" onClick={onClose}>
          {t('done')}
        </button>
      </div>
    </div>
  )
}
