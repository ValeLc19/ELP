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
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n) => String(n).padStart(2, '0')
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sundayOf = (d) => addDays(d, -d.getDay())

// Today at midnight — the calendar opens on the real current month.
function startOfToday() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}
const TODAY_ISO = isoOf(startOfToday())

// "7:00 am" / "9:30 pm" -> minutes since midnight, for sorting.
function timeToMinutes(t) {
  const m = t.match(/(\d+):(\d+)\s*(am|pm)/i)
  if (!m) return 0
  let h = parseInt(m[1], 10) % 12
  if (/pm/i.test(m[3])) h += 12
  return h * 60 + parseInt(m[2], 10)
}

// Index events by their real calendar date.
function eventsByIso(events) {
  const map = {}
  for (const e of events) {
    if (!map[e.iso]) map[e.iso] = []
    map[e.iso].push(e)
  }
  return map
}

function MonthView({ anchor, events, selectedId, onSelect }) {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const byIso = eventsByIso(events)

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

  const cells = Array.from({ length: total }, (_, i) => {
    const dayNum = i - firstWeekday + 1
    if (dayNum < 1 || dayNum > daysInMonth) return null
    return new Date(year, month, dayNum)
  })

  return (
    <div className="cal-grid">
      {WEEKDAYS.map((d) => (
        <div key={d} className="cal-weekday">
          {d}
        </div>
      ))}
      {cells.map((date, i) => {
        if (!date) return <div key={`b${i}`} className="cal-cell cal-cell--blank" />
        const dayEvents = byIso[isoOf(date)] || []
        const shown = dayEvents.slice(0, 3)
        const extra = dayEvents.length - shown.length
        const isToday = isoOf(date) === TODAY_ISO
        return (
          <div key={isoOf(date)} className={`cal-cell ${isToday ? 'cal-cell--today' : ''}`}>
            <span className="cal-cell__num">{date.getDate()}</span>
            <div className="cal-cell__events">
              {shown.map((e) => (
                <button
                  key={e.id}
                  className={`cal-event ${e.id === selectedId ? 'cal-event--selected' : ''}`}
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

function WeekView({ anchor, events, selectedId, onSelect }) {
  const byIso = eventsByIso(events)
  const start = sundayOf(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div className="cal-week">
      {days.map((date, i) => {
        const dayEvents = (byIso[isoOf(date)] || [])
          .slice()
          .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
        const isToday = isoOf(date) === TODAY_ISO
        return (
          <div
            key={isoOf(date)}
            className={`cal-week__col ${isToday ? 'cal-week__col--today' : ''}`}
          >
            <div className={`cal-week__head ${isToday ? 'cal-week__head--today' : ''}`}>
              <span className="cal-week__day">{WEEKDAYS[i].slice(0, 3)}</span>
              <span className="cal-week__num">{date.getDate()}</span>
            </div>
            <div className="cal-week__events">
              {dayEvents.map((e) => (
                <button
                  key={e.id}
                  className={`cal-week__event ${
                    e.id === selectedId ? 'cal-week__event--selected' : ''
                  }`}
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

export default function CalendarView({ events, selectedId, onSelect }) {
  const [mode, setMode] = useState('Month')
  const [anchor, setAnchor] = useState(startOfToday)

  const step = (dir) => {
    if (mode === 'Month') {
      setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + dir, 1))
    } else {
      setAnchor(addDays(anchor, dir * 7))
    }
  }

  const start = sundayOf(anchor)
  const end = addDays(start, 6)
  const heading =
    mode === 'Month'
      ? `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`
      : `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}–${end.getDate()}`

  return (
    <div className="calendar">
      <div className="calendar__head">
        <h2 className="calendar__month">{heading}</h2>
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
          <button className="calendar__arrow" onClick={() => step(-1)} aria-label="Previous">
            ◀
          </button>
          <button className="calendar__arrow" onClick={() => step(1)} aria-label="Next">
            ▶
          </button>
        </div>
      </div>

      {mode === 'Month' ? (
        <MonthView
          anchor={anchor}
          events={events}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ) : (
        <WeekView
          anchor={anchor}
          events={events}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}
