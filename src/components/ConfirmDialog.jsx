import { useLang } from '../lib/i18n.js'
import './ConfirmDialog.css'

// Reusable "Are you sure?" dialog for destructive actions.
export default function ConfirmDialog({ message, confirmLabel, onConfirm, onCancel }) {
  const { t } = useLang()
  return (
    <div className="confirm" role="dialog" aria-modal="true">
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
    </div>
  )
}
