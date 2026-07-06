import { createPortal } from 'react-dom'
import { useLang } from '../lib/i18n.js'
import './ConfirmDialog.css'

// Reusable "Are you sure?" dialog for destructive actions. Rendered through a
// portal to document.body so its position:fixed overlay is always relative to
// the viewport — never trapped by an ancestor's transform (e.g. a card's hover
// lift), which otherwise causes the overlay to flicker.
export default function ConfirmDialog({ message, confirmLabel, onConfirm, onCancel }) {
  const { t } = useLang()
  return createPortal(
    <div
      className="confirm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="confirm__backdrop" onClick={onCancel} />
      <div className="confirm__card">
        <p className="confirm__msg">{message}</p>
        <div className="confirm__actions">
          <button className="confirm__cancel" onClick={onCancel}>
            {t('cancel')}
          </button>
          <button className="confirm__ok" onClick={onConfirm}>
            {confirmLabel || t('remove')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
