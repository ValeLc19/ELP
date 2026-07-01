import { categoryColor, categoryTint } from '../data/categories.js'
import { useSaved } from '../lib/saved.js'
import {
  LocationIcon,
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  HeartIcon,
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
  const saveKey = event.seriesId || event.id
  const saved = isSaved(saveKey)

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
        <button
          className={`save-heart ${saved ? 'is-saved' : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save event'}
          aria-pressed={saved}
          onClick={(e) => {
            e.stopPropagation()
            if (onRequireAuth && !onRequireAuth()) return
            toggle(saveKey)
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>

      <div className="ev-card__body">
        <div className="ev-card__head">
          <h3 className="ev-card__title">{event.title}</h3>
          <span
            className="badge badge--filled"
            style={{ background: categoryTint(event.category), color: 'var(--ink)' }}
          >
            <span className="badge__dot" style={{ background: color }} />
            {event.category}
          </span>
        </div>

        {compact ? (
          <p className="ev-meta">
            <CalendarIcon /> {event.date} · {event.time}
            {event.recurLabel && (
              <span className="recur-tag">{event.recurLabel}</span>
            )}
          </p>
        ) : (
          <>
            {event.family && (
              <p className="ev-meta">
                <UsersIcon /> Family Event
              </p>
            )}
            <p className="ev-meta">
              <LocationIcon /> {event.address}
            </p>
            <p className="ev-meta">
              <CalendarIcon /> {event.date} · {event.time}
              {event.recurLabel && (
                <span className="recur-tag">{event.recurLabel}</span>
              )}
            </p>
            <p className="ev-meta">
              <TicketIcon /> {event.price}
            </p>
          </>
        )}

        <button className="see-details" onClick={() => onSelect(event.id)}>
          See Details →
        </button>
      </div>
    </article>
  )
}
