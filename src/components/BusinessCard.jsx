import { ShareIcon, TrashIcon, GoogleIcon } from './icons.jsx'
import { useLang } from '../lib/i18n.js'

const AVATAR_COLORS = ['#d15a3a', '#2e6f69', '#9b6fc7', '#e0a83e', '#5b7fd4', '#3aa6a0']

function initials(name) {
  const s = name.replace(/[^a-zA-Z0-9]/g, '')
  return (s.slice(0, 2) || '??').toUpperCase()
}
function colorFor(name) {
  let h = 0
  for (const c of name) h = (h + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

export default function BusinessCard({ biz, isNew, onRemove }) {
  const { t } = useLang()
  return (
    <article className="biz-card">
      {isNew && <span className="biz-card__new">{t('new')}</span>}
      <div
        className="biz-card__avatar"
        style={{ background: colorFor(biz.name) }}
      >
        {initials(biz.name)}
      </div>
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
          aria-label={t('close')}
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
