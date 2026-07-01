import { useState } from 'react'
import { categoryColor, categoryTint } from '../data/categories.js'
import { useSaved } from '../lib/saved.js'
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
} from './icons.jsx'

export default function EventDetail({ event, onBack }) {
  const color = categoryColor(event.category)
  const [copied, setCopied] = useState(false)
  const { isSaved, toggle } = useSaved()
  const saveKey = event.seriesId || event.id
  const saved = isSaved(saveKey)

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
          className="detail__img"
          style={{ backgroundImage: `url("${event.image}")` }}
        >
          <span className="ev-card__price-tag">{event.price}</span>
          <button
            className={`save-heart ${saved ? 'is-saved' : ''}`}
            aria-label={saved ? 'Remove from saved' : 'Save event'}
            aria-pressed={saved}
            onClick={() => toggle(saveKey)}
          >
            <HeartIcon filled={saved} />
          </button>
        </div>

        <div className="detail__body">
          <h2 className="detail__title">{event.title}</h2>
          <span
            className="badge badge--filled"
            style={{ background: categoryTint(event.category), color: 'var(--ink)' }}
          >
            <span className="badge__dot" style={{ background: color }} />
            {event.category}
          </span>

          <hr className="detail__rule" />

          <div className="detail__meta">
            {event.ageNote && (
              <p className="ev-meta">
                <UsersIcon /> {event.ageNote}
              </p>
            )}
            {event.family && !event.ageNote && (
              <p className="ev-meta">
                <UsersIcon /> Family Event
              </p>
            )}
            <p className="ev-meta">
              <LocationIcon /> {event.address}
            </p>
            <p className="ev-meta">
              <CalendarIcon /> {event.date}
              {event.recurLabel && (
                <span className="recur-tag">{event.recurLabel}</span>
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
            <ChatIcon /> About:
          </h4>
          <p className="detail__text">{event.about}</p>

          {event.additionalInfo && (
            <>
              <h4 className="detail__label">Additional Information:</h4>
              <p className="detail__text">{event.additionalInfo}</p>
            </>
          )}

          {event.host && (
            <div className="detail__host">
              <div>
                <h4 className="detail__label">Host:</h4>
                <p className="detail__text">{event.host}</p>
              </div>
              <div className="detail__host-actions">
                {copied && <span className="copied-toast">Copied!</span>}
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
            </div>
          )}
        </div>
      </div>

      {event.sourceUrl && (
        <div className="detail__footer">
          <a
            className="register"
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            More Info →
          </a>
        </div>
      )}
    </div>
  )
}
