import { useState } from 'react'
import { ShareIcon, TrashIcon, GoogleIcon } from './icons.jsx'
import { useLang } from '../lib/i18n.js'

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
  return Math.max(0.35, 1 - (age / NEW_WINDOW_DAYS) * 0.65)
}

export default function BusinessCard({ biz, onRemove }) {
  const { t } = useLang()
  const [imgOk, setImgOk] = useState(true)
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

      {imgOk && biz.avatar ? (
        <img
          className="biz-card__avatar biz-card__avatar--img"
          src={biz.avatar}
          alt={biz.name}
          loading="lazy"
          onError={() => setImgOk(false)}
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
          onClick={() => onRemove(biz.id)}
          aria-label="Remove"
          title="Remove"
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
    </article>
  )
}
