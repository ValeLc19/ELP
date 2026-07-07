import { useState } from 'react'
import { categoryColor, categoryTint } from '../data/categories.js'
import { moreInfoUrl, socialUrl } from '../data/events.js'
import { useSaved } from '../lib/saved.js'
import { removeUserEvent } from '../lib/userEvents.js'
import { useAuth } from '../lib/auth.js'
import { useLang } from '../lib/i18n.js'
import ConfirmDialog from './ConfirmDialog.jsx'
import {
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  UsersIcon,
  ChatIcon,
  CopyIcon,
  CheckIcon,
  HeartIcon,
  InstagramIcon,
} from './icons.jsx'

export default function EventDetail({ event, onBack, onRequireAuth }) {
  const color = categoryColor(event.category)
  const [copied, setCopied] = useState(false)
  const { isSaved, toggle } = useSaved()
  const { user } = useAuth()
  const { t } = useLang()
  const [confirmUnsave, setConfirmUnsave] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const saveKey = event.seriesId || event.id
  const saved = isSaved(saveKey)
  // Events the user added themselves (paste-a-link) can be removed here.
  const isUserAdded = event.fromBusiness && String(event.id).startsWith('uev-')

  // Past events open as a muted "already passed" state, not an active card.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPast = event.dateObj < today

  const eventUrl = `${window.location.origin}${window.location.pathname}?event=${encodeURIComponent(event.id)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="detail">
      <button className="detail__back" onClick={onBack} aria-label="Back to events">
        ←
      </button>

      <div className="detail__scroll">
        <div
          className={`detail__img ${isPast ? 'detail__img--past' : ''}`}
          style={{ backgroundImage: `url("${event.image}")` }}
        >
          <span className="ev-card__price-tag">{event.price}</span>
          {!isPast && user && (
            <button
              className={`save-heart ${saved ? 'is-saved' : ''}`}
              aria-label={saved ? 'Remove from saved' : 'Save event'}
              aria-pressed={saved}
              onClick={() => (saved ? setConfirmUnsave(true) : toggle(saveKey))}
            >
              <HeartIcon filled={saved} />
            </button>
          )}
        </div>

        <div className="detail__body">
          <h2 className="detail__title">{event.title}</h2>
          <span
            className="badge badge--filled"
            style={{ background: categoryTint(event.category), color: 'var(--ink)' }}
          >
            <span className="badge__dot" style={{ background: color }} />
            {t(`cat_${event.category}`)}
          </span>

          {isPast && <p className="detail__passed">{t('eventPassed')}</p>}

          <hr className="detail__rule" />

          <div className="detail__meta">
            {event.ageNote && (
              <p className="ev-meta">
                <UsersIcon /> {event.ageNote}
              </p>
            )}
            {event.family && !event.ageNote && (
              <p className="ev-meta">
                <UsersIcon /> {t('familyEvent')}
              </p>
            )}
            <p className="ev-meta">
              <LocationIcon /> {event.address}
            </p>
            <p className="ev-meta">
              <CalendarIcon /> {event.date}
              {event.recurLabel && (
                <span className="recur-tag">{t(`recur_${event.recurLabel}`)}</span>
              )}
            </p>
            <p className="ev-meta">
              <ClockIcon /> {event.time}
            </p>
            <p className="ev-meta">
              <TicketIcon /> {event.price}
            </p>
          </div>

          <hr className="detail__rule" />

          <h4 className="detail__label">
            <ChatIcon /> {t('about')}
          </h4>
          <p className="detail__text">{event.about}</p>

          {event.additionalInfo && (
            <>
              <h4 className="detail__label">{t('additionalInfo')}</h4>
              <p className="detail__text">{event.additionalInfo}</p>
            </>
          )}

          {event.host && (
            <div className="detail__host">
              <div>
                <h4 className="detail__label">{t('host')}</h4>
                <p className="detail__text">{event.host}</p>
              </div>
              {/* Copy-link only for public events — a private, user-added event
                  has no shareable link (it lives only in your account). */}
              {!isUserAdded && (
                <div className="detail__host-actions">
                  {copied && <span className="copied-toast">{t('copied')}</span>}
                  <button
                    onClick={copyLink}
                    aria-label="Copy event link"
                    className={copied ? 'is-copied' : ''}
                  >
                    {copied ? (
                      <CheckIcon width={15} height={15} />
                    ) : (
                      <CopyIcon width={15} height={15} />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {isUserAdded && (
            <button className="detail__remove" onClick={() => setConfirmRemove(true)}>
              {t('removeEvent')}
            </button>
          )}
        </div>
      </div>

      {(moreInfoUrl(event) || socialUrl(event)) && !isPast && (
        <div className="detail__footer">
          {socialUrl(event) && (
            <a
              className="detail__social"
              href={socialUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon width={22} height={22} />
            </a>
          )}
          {moreInfoUrl(event) && (
            <a
              className="register"
              href={moreInfoUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('moreInfo')}
            </a>
          )}
        </div>
      )}

      {confirmRemove && (
        <ConfirmDialog
          message={t('confirmRemoveEvent')}
          confirmLabel={t('remove')}
          onConfirm={() => {
            setConfirmRemove(false)
            removeUserEvent(event.id)
            onBack()
          }}
          onCancel={() => setConfirmRemove(false)}
        />
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
  )
}
