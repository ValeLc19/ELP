import { useState } from 'react'
import { categoryColor, categoryTint } from '../data/categories.js'
import { moreInfoUrl, instagramUrl, hasPrice } from '../data/events.js'
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
  GoogleIcon,
  ExternalLinkIcon,
} from './icons.jsx'

// Keeps a footer link/button from also triggering the card's own click/Enter.
const swallow = (e) => e.stopPropagation()

export default function EventCard({
  event,
  onSelect,
  onRequireAuth,
  variant = 'full',
  // Which action gets the filled button: 'details' (the in-app detail view) or
  // 'more' (the event's own page / a Google search). Falls back to the event's
  // own preference, then to 'details'. An event with no details page of its own
  // can therefore promote its external link instead.
  primaryAction,
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
  const instagram = instagramUrl(event)

  // 'more' can only be primary if there is actually a link to point at.
  const wanted = primaryAction ?? event.primaryAction ?? 'details'
  const primary = wanted === 'more' && more ? 'more' : 'details'

  // Whichever action isn't primary demotes to an icon — never both.
  const moreAsIcon = more && primary !== 'more'
  const moreLabel = more?.isSearch ? t('ariaGoogle') : t('ariaMoreInfo')

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
        {hasPrice(event) && (
          <span className="ev-card__price-tag">{event.price}</span>
        )}
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
        {/* Three bands that line up across every card in a row: eyebrow,
            two-line title, date. Everything below is free to vary. */}
        <div className="ev-card__eyebrow">
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

        <h3 className="ev-card__title" title={event.title}>
          {event.title}
        </h3>

        <p className="ev-meta ev-card__date">
          <CalendarIcon /> {event.date}
          {event.time ? ` · ${event.time}` : ''}
          {event.recurLabel && (
            <span className="recur-tag">{t(`recur_${event.recurLabel}`)}</span>
          )}
        </p>

        {event.fromBusiness && (
          <p className="ev-card__from">
            <ShopIcon width={14} height={14} /> {event.businessName}
          </p>
        )}

        {!compact && (
          <>
            {event.family && (
              <p className="ev-meta">
                <UsersIcon /> {t('familyEvent')}
              </p>
            )}
            {event.address && (
              <p className="ev-meta">
                <LocationIcon /> {event.address}
              </p>
            )}
            {hasPrice(event) && (
              <p className="ev-meta">
                <TicketIcon /> {event.price}
              </p>
            )}
          </>
        )}

        <div className="ev-card__footer">
          {primary === 'more' ? (
            <a
              className="ev-card__cta"
              href={more.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={swallow}
              onKeyDown={swallow}
            >
              {more.isSearch ? t('ctaSearchGoogle') : t('ctaMoreInfo')}
              <span aria-hidden="true">→</span>
            </a>
          ) : (
            <button
              type="button"
              className="ev-card__cta"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(event.id)
              }}
              onKeyDown={swallow}
            >
              {t('seeDetails')}
              <span aria-hidden="true">→</span>
            </button>
          )}

          {(instagram || moreAsIcon) && (
            <div className="ev-card__links">
              {instagram && (
                <a
                  className="ev-card__iconlink"
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={swallow}
                  onKeyDown={swallow}
                  aria-label={t('ariaInstagram')}
                  title={t('ariaInstagram')}
                >
                  <InstagramIcon width={17} height={17} />
                </a>
              )}
              {moreAsIcon && (
                <a
                  className="ev-card__iconlink"
                  href={more.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={swallow}
                  onKeyDown={swallow}
                  aria-label={moreLabel}
                  title={moreLabel}
                >
                  {more.isSearch ? (
                    <GoogleIcon width={16} height={16} />
                  ) : (
                    <ExternalLinkIcon width={17} height={17} />
                  )}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
