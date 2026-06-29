import { categoryColor } from '../data/categories.js'
import {
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  UsersIcon,
} from './icons.jsx'

export default function EventDetail({ event, onBack }) {
  const color = categoryColor(event.category)

  return (
    <div className="detail">
      <button className="detail__back" onClick={onBack} aria-label="Back to events">
        ←
      </button>

      <div
        className="detail__img"
        style={{ backgroundImage: `url(${event.image})` }}
      />

      <div className="detail__body">
        <h2 className="detail__title">{event.title}</h2>
        <span className="badge" style={{ color, borderColor: color }}>
          <span className="badge__dot" style={{ background: color }} />
          {event.category}
        </span>

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
          </p>
          <p className="ev-meta">
            <ClockIcon /> {event.time}
          </p>
          <p className="ev-meta">
            <TicketIcon /> {event.price}
          </p>
        </div>

        <hr className="detail__rule" />

        <h4 className="detail__label">About:</h4>
        <p className="detail__text">{event.about}</p>

        {event.additionalInfo && (
          <>
            <h4 className="detail__label">Additional Information:</h4>
            <p className="detail__text">{event.additionalInfo}</p>
          </>
        )}

        {event.host && (
          <>
            <h4 className="detail__label">Host:</h4>
            <p className="detail__text">{event.host}</p>
          </>
        )}

        <button className="register">Register</button>
      </div>
    </div>
  )
}
