import { categoryColor, categoryTint } from '../data/categories.js'
import {
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  UsersIcon,
} from './icons.jsx'

export default function EventCard({ event, onSelect, variant = 'full' }) {
  const color = categoryColor(event.category)
  const compact = variant === 'compact'

  return (
    <article className={`ev-card ${compact ? 'ev-card--compact' : ''}`}>
      <div
        className="ev-card__img"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        <span className="ev-card__price-tag">{event.price}</span>
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
          <>
            <p className="ev-meta">
              <CalendarIcon /> {event.date} &nbsp; {event.time}
            </p>
            <p className="ev-meta">
              <TicketIcon /> {event.price}
            </p>
          </>
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
              <CalendarIcon /> {event.date}
            </p>
            <p className="ev-meta">
              <ClockIcon /> {event.time}
            </p>
            <p className="ev-meta">
              <TicketIcon /> {event.price}
            </p>
          </>
        )}

        <button className="see-details" onClick={() => onSelect(event.id)}>
          See Details {compact ? '→' : ''}
        </button>
      </div>
    </article>
  )
}
