import { useState } from 'react'
import { categoryColor } from '../data/categories.js'

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

// Mock month: December with day 1 on Sunday (matches the design).
// When real data arrives we can compute the true weekday offset.
const DAYS_IN_MONTH = 31
const MONTH_NAME = 'December'

// The week shown in Week view (day-of-month range, Sun–Sat).
const WEEK_START = 15

function eventsByDay(events) {
  const map = {}
  for (const e of events) {
    if (!map[e.day]) map[e.day] = []
    map[e.day].push(e)
  }
  return map
}

function MonthView({ events, onSelect }) {
  const byDay = eventsByDay(events)
  const cells = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1)

  return (
    <div className="cal-grid">
      {WEEKDAYS.map((d) => (
        <div key={d} className="cal-weekday">
          {d}
        </div>
      ))}
      {cells.map((day) => {
        const dayEvents = byDay[day] || []
        const shown = dayEvents.slice(0, 3)
        const extra = dayEvents.length - shown.length
        return (
          <div key={day} className="cal-cell">
            <span className="cal-cell__num">{day}</span>
            <div className="cal-cell__events">
              {shown.map((e) => (
                <button
                  key={e.id}
                  className="cal-event"
                  onClick={() => onSelect(e.id)}
                  title={e.title}
                >
                  <span
                    className="cal-event__bar"
                    style={{ background: categoryColor(e.category) }}
                  />
                  <span className="cal-event__name">{e.title}</span>
                </button>
              ))}
              {extra > 0 && <span className="cal-cell__more">+{extra}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WeekView({ events, onSelect }) {
  const byDay = eventsByDay(events)
  const days = Array.from({ length: 7 }, (_, i) => WEEK_START + i)

  return (
    <div className="cal-week">
      {days.map((day, i) => {
        const dayEvents = (byDay[day] || [])
          .slice()
          .sort((a, b) => a.time.localeCompare(b.time))
        return (
          <div key={day} className="cal-week__col">
            <div className="cal-week__head">
              <span className="cal-week__day">{WEEKDAYS[i].slice(0, 3)}</span>
              <span className="cal-week__num">{day}</span>
            </div>
            <div className="cal-week__events">
              {dayEvents.map((e) => (
                <button
                  key={e.id}
                  className="cal-week__event"
                  onClick={() => onSelect(e.id)}
                  style={{ borderColor: categoryColor(e.category) }}
                >
                  <span className="cal-week__time">{e.time}</span>
                  <span className="cal-week__title">{e.title}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CalendarView({ events, onSelect }) {
  const [mode, setMode] = useState('Month')

  return (
    <div className="calendar">
      <div className="calendar__head">
        <h2 className="calendar__month">{MONTH_NAME}</h2>
        <div className="calendar__controls">
          <div className="seg">
            <button
              className={`seg__btn ${mode === 'Month' ? 'seg__btn--active' : ''}`}
              onClick={() => setMode('Month')}
            >
              Month
            </button>
            <button
              className={`seg__btn ${mode === 'Week' ? 'seg__btn--active' : ''}`}
              onClick={() => setMode('Week')}
            >
              Week
            </button>
          </div>
          <button className="calendar__arrow" aria-label="Previous">
            ◀
          </button>
          <button className="calendar__arrow" aria-label="Next">
            ▶
          </button>
        </div>
      </div>

      {mode === 'Month' ? (
        <MonthView events={events} onSelect={onSelect} />
      ) : (
        <WeekView events={events} onSelect={onSelect} />
      )}
    </div>
  )
}
