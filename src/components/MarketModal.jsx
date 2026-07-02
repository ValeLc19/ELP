import { XIcon } from './icons.jsx'
import { useLang } from '../lib/i18n.js'
import './AddBusinessModal.css'

// Placeholder for the storefront icon — a directory of the local businesses
// whose accounts have been added. Real listing needs a backend.
export default function MarketModal({ onClose }) {
  const { t } = useLang()
  return (
    <div className="biz" role="dialog" aria-modal="true">
      <div className="biz__backdrop" onClick={onClose} />
      <div className="biz__card" style={{ textAlign: 'center' }}>
        <button className="biz__close" onClick={onClose} aria-label={t('close')}>
          <XIcon />
        </button>
        <h2 className="biz__title" style={{ marginRight: 0 }}>
          {t('businessesTitle')}
        </h2>
        <p style={{ color: '#4a4038', lineHeight: 1.5, margin: '0 0 1.4rem' }}>
          {t('businessesText')}
        </p>
        <button className="biz__done" onClick={onClose}>
          {t('close')}
        </button>
      </div>
    </div>
  )
}
