import { useState } from 'react'
import { categoryColor, categoryTint } from '../data/categories.js'
import { moreInfoUrl, socialUrl } from '../data/events.js'
import { useSaved } from '../lib/saved.js'
import { useAuth } from '../lib/auth.js'
import { useLang } from '../lib/i18n.js'
import ConfirmDialog from './ConfirmDialog.jsx'
import {
  LocationIcon,
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  HeartIcon,
  ShopIcon,
  InstagramIcon,
} from './icons.jsx'

export default function EventCard({
  event,
  onSelect,
  onRequireAuth,
  variant = 'full',
}) {
  const color = categoryColor(event.category)
  const compact = variant === 'compact'
  const { isSaved, toggle } = useSaved()
  const { user } = useAuth()
  const { t } = useLang()
  const [confirmUnsave, setConfirmUnsave] = useState(false)
  const saveKey = event.seriesId || event.id
  const saved = isSaved(saveKey)
  const more = moreInfoUrl(event)

  return (
    <article
      className={`ev-card ${compact ? 'ev-card--compact' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(event.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(event.id)
        }
      }}
    >
      <div
        className="ev-card__img"
        style={{ backgroundImage: `url("${event.image}")` }}
      >
        <span className="ev-card__price-tag">{event.price}</span>
        {user && (
          <button
            className={`save-heart ${saved ? 'is-saved' : ''}`}
            aria-label={saved ? 'Remove from saved' : 'Save event'}
            aria-pressed={saved}
            onClick={(e) => {
              e.stopPropagation()
              if (saved) setConfirmUnsave(true)
              else toggle(saveKey)
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <HeartIcon filled={saved} />
          </button>
        )}
        {confirmUnsave && (
          <ConfirmDialog
            message={t('confirmUnsave')}
            confirmLabel={t('remove')}
            onConfirm={() => {
              setConfirmUnsave(false)
              toggle(saveKey)
            }}
            onCancel={() => setConfirmUnsave(false)}
          />
        )}
      </div>

      <div className="ev-card__body">
        <div className="ev-card__head">
          <h3 className="ev-card__title">{event.title}</h3>
          <span
            className="badge badge--filled"
            style={{ background: categoryTint(event.category), color: 'var(--ink)' }}
          >
            <span className="badge__dot" style={{ background: color }} />
            {t(`cat_${event.category}`)}
            {event.categories && event.categories.length > 1 && (
              <span className="badge__more"> +{event.categories.length - 1}</span>
            )}
          </span>
        </div>

        {event.fromBusiness && (
          <p className="ev-card__from">
            <ShopIcon width={14} height={14} /> {event.businessName}
          </p>
        )}

        {compact ? (
          <p className="ev-meta">
            <CalendarIcon /> {event.date} · {event.time}
            {event.recurLabel && (
              <span className="recur-tag">{t(`recur_${event.recurLabel}`)}</span>
            )}
          </p>
        ) : (
          <>
            {event.family && (
              <p className="ev-meta">
                <UsersIcon /> {t('familyEvent')}
              </p>
            )}
            <p className="ev-meta">
              <LocationIcon /> {event.address}
            </p>
            <p className="ev-meta">
              <CalendarIcon /> {event.date} · {event.time}
              {event.recurLabel && (
                <span className="recur-tag">{t(`recur_${event.recurLabel}`)}</span>
              )}
            </p>
            <p className="ev-meta">
              <TicketIcon /> {event.price}
            </p>
          </>
        )}

        <div className="ev-card__actions">
          {socialUrl(event) && (
            <a
              className="ev-card__social"
              href={socialUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Instagram"
            >
              <InstagramIcon width={17} height={17} />
            </a>
          )}
          {more && (
            <a
              className="ev-card__moreinfo"
              href={more.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {more.isSearch ? t('searchGoogle') : t('moreInfo')}
            </a>
          )}
          <button className="see-details" onClick={() => onSelect(event.id)}>
            {t('seeDetails')} →
          </button>
        </div>
      </div>
    </article>
  )
}
