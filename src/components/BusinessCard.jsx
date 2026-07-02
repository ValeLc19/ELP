import { useState } from 'react'
import { ShareIcon, TrashIcon, GoogleIcon } from './icons.jsx'
import { useLang } from '../lib/i18n.js'
import { avatarCandidates } from '../lib/businesses.js'
import ConfirmDialog from './ConfirmDialog.jsx'

const AVATAR_COLORS = ['#d15a3a', '#2e6f69', '#9b6fc7', '#e0a83e', '#5b7fd4', '#3aa6a0']

function initials(name) {
  const parts = name.split(/\s+/).filter(Boolean)
  const s = parts.length > 1 ? parts[0][0] + parts[1][0] : name.replace(/[^a-z0-9]/gi, '').slice(0, 2)
  return (s || '??').toUpperCase()
}
function colorFor(name) {
  let h = 0
  for (const c of name) h = (h + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

// The "new event" dot lives for a few days, fading as it ages, then disappears.
const NEW_WINDOW_DAYS = 5
function newDotOpacity(addedAt) {
  if (!addedAt) return 0
  const age = (Date.now() - addedAt) / 86400000
  if (age >= NEW_WINDOW_DAYS) return 0
  // starts soft (0.8) and eases down to ~0.3 before disappearing
  return Math.max(0.3, 0.8 - (age / NEW_WINDOW_DAYS) * 0.5)
}

export default function BusinessCard({ biz, onRemove }) {
  const { t } = useLang()
  const candidates = avatarCandidates(biz.handle)
  const [imgIdx, setImgIdx] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const imgSrc = candidates[imgIdx]
  const dot = newDotOpacity(biz.addedAt)

  return (
    <article className="biz-card">
      {dot > 0 && (
        <span
          className="biz-card__dot"
          style={{ opacity: dot }}
          title={t('new')}
          aria-label={t('new')}
        />
      )}

      {imgSrc ? (
        <img
          className="biz-card__avatar biz-card__avatar--img"
          src={imgSrc}
          alt={biz.name}
          loading="lazy"
          onError={() => setImgIdx((i) => i + 1)}
        />
      ) : (
        <div className="biz-card__avatar" style={{ background: colorFor(biz.name) }}>
          {initials(biz.name)}
        </div>
      )}

      <h3 className="biz-card__name">{biz.name}</h3>

      <div className="biz-card__actions">
        <a
          className="biz-card__act"
          href={biz.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open account"
          title="Open account"
        >
          <ShareIcon width={20} height={20} />
        </a>
        <button
          className="biz-card__act biz-card__act--del"
          onClick={() => setConfirming(true)}
          aria-label={t('remove')}
          title={t('remove')}
        >
          <TrashIcon width={19} height={19} />
        </button>
        <a
          className="biz-card__act"
          href={`https://www.google.com/search?q=${encodeURIComponent(biz.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Search on Google"
          title="Search on Google"
        >
          <GoogleIcon width={22} height={22} />
        </a>
      </div>

      {confirming && (
        <ConfirmDialog
          message={t('confirmRemoveBiz')}
          confirmLabel={t('remove')}
          onConfirm={() => {
            setConfirming(false)
            onRemove(biz.id)
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </article>
  )
}

