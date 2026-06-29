import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './Events.css'
import { EVENTS } from '../data/events.js'
import {
  CATEGORY_ORDER,
  categoryColor,
  categoryTint,
  hexToRgba,
  ALL_COLOR,
} from '../data/categories.js'
import MapView from '../components/MapView.jsx'
import CalendarView from '../components/CalendarView.jsx'
import EventCard from '../components/EventCard.jsx'
import EventDetail from '../components/EventDetail.jsx'
import { SearchIcon, ScanFaceIcon } from '../components/icons.jsx'

const DATE_FILTERS = ['Today', 'This Weekend', 'This Week']

function priceValue(p) {
  if (/free/i.test(p)) return 0
  const m = p.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// Date-filter window helpers, computed from the real current date.
function dateWindow() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = addDays(today, -today.getDay()) // Sunday
  const weekEnd = addDays(weekStart, 6) // Saturday
  return { today, weekStart, weekEnd }
}

function matchesDateFilter(event, filter, win) {
  const d = event.dateObj
  if (filter === 'Today') return d.getTime() === win.today.getTime()
  if (filter === 'This Week') return d >= win.weekStart && d <= win.weekEnd
  if (filter === 'This Weekend') {
    const weekend = d.getDay() === 0 || d.getDay() === 6
    return weekend && d >= win.today && d <= win.weekEnd
  }
  return true
}

export default function Events() {
  const navigate = useNavigate()
  const [view, setView] = useState('map') // 'map' | 'calendar' | 'list'
  const [activeCat, setActiveCat] = useState('All')
  const [activeDate, setActiveDate] = useState(null)
  const [sortBy, setSortBy] = useState('Date')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const resetFilters = () => {
    setActiveCat('All')
    setActiveDate(null)
    setQuery('')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const win = dateWindow()
    return EVENTS.filter((e) => {
      const catOk = activeCat === 'All' || e.category === activeCat
      const qOk =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
      // Date filters don't apply in calendar view (you navigate by date there).
      const dateOk = view === 'calendar' || matchesDateFilter(e, activeDate, win)
      return catOk && qOk && dateOk
    })
  }, [activeCat, activeDate, query, view])

  const sorted = useMemo(() => {
    const arr = filtered.slice()
    arr.sort((a, b) =>
      sortBy === 'Price' ? priceValue(a.price) - priceValue(b.price) : a.day - b.day
    )
    return arr
  }, [filtered, sortBy])

  const selected = EVENTS.find((e) => e.id === selectedId) || null

  const tabs = (
    <div className="tabs">
      {['Map', 'Calendar', 'List'].map((t) => {
        const key = t.toLowerCase()
        return (
          <button
            key={t}
            className={`tab ${view === key ? 'tab--active' : ''}`}
            onClick={() => setView(key)}
          >
            {t}
          </button>
        )
      })}
    </div>
  )

  const controls = (
    <>
      <div className="searchbar">
        <SearchIcon />
        <input
          type="text"
          placeholder="Sunland Park"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {tabs}

      <div className="filters">
        <span className="filters__label">Filter by:</span>
        <div className="filters__rows">
          {view !== 'calendar' && (
            <div className="filters__row">
              {DATE_FILTERS.map((d) => (
                <button
                  key={d}
                  className={`chip ${activeDate === d ? 'chip--on-date' : ''}`}
                  onClick={() => setActiveDate(activeDate === d ? null : d)}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
          <div className="filters__row">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                className="chip"
                style={{
                  borderColor: categoryColor(c),
                  background: activeCat === c ? categoryTint(c, 0.55) : undefined,
                }}
                onClick={() => setActiveCat(c)}
              >
                <span
                  className="badge__dot"
                  style={{ background: categoryColor(c) }}
                />
                {c}
              </button>
            ))}
            <button
              className="chip"
              style={{
                borderColor: ALL_COLOR,
                background:
                  activeCat === 'All' ? hexToRgba(ALL_COLOR, 0.55) : undefined,
              }}
              onClick={() => setActiveCat('All')}
            >
              <span className="badge__dot" style={{ background: ALL_COLOR }} />
              All
            </button>
          </div>
        </div>
      </div>
    </>
  )

  const emptyState = (
    <div className="empty">
      <p className="empty__msg">
        Sorry!
        <br />
        No events found.
        <br />
        The closest event is:
      </p>
      <EventCard event={EVENTS[0]} onSelect={setSelectedId} />
      <button className="empty__similar" onClick={resetFilters}>
        See similar events
      </button>
    </div>
  )

  const detailPanel = <EventDetail event={selected} onBack={() => setSelectedId(null)} />

  const header = (
    <header className="events__header">
      <h1 className="events__logo" onClick={() => navigate('/')} title="Back to home">
        ELP
      </h1>
      <button className="events__profile" aria-label="Profile">
        <ScanFaceIcon />
      </button>
    </header>
  )

  // ---------- List view ----------
  if (view === 'list') {
    return (
      <div className="events">
        {header}
        <div className="events__controls">{controls}</div>

        <div className={`list-layout ${selected ? 'list-layout--split' : ''}`}>
          <section className="list-panel">
            <div className="list-panel__head">
              <h2 className="events__panel-title">Events:</h2>
              <div className="sort">
                <span className="sort__label">Sort by:</span>
                <div className="seg">
                  {['Date', 'Price'].map((s) => (
                    <button
                      key={s}
                      className={`seg__btn ${sortBy === s ? 'seg__btn--active' : ''}`}
                      onClick={() => setSortBy(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sorted.length === 0 ? (
              emptyState
            ) : (
              <div className="list-grid">
                {sorted.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    variant="compact"
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            )}
          </section>

          {selected && <aside className="events__panel">{detailPanel}</aside>}
        </div>
      </div>
    )
  }

  // ---------- Map / Calendar views ----------
  return (
    <div className="events">
      {header}
      <div className="events__layout">
        <section className="events__main">
          {controls}
          <div className="main-view">
            {view === 'map' ? (
              <div className="map-wrap">
                <MapView
                  events={filtered}
                  selectedId={selectedId}
                  onSelectPin={setSelectedId}
                />
              </div>
            ) : (
              <CalendarView
                events={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
          </div>
        </section>

        <aside className="events__panel">
          {selected ? (
            detailPanel
          ) : (
            <>
              <h2 className="events__panel-title">Events:</h2>
              {filtered.length === 0 ? (
                emptyState
              ) : (
                <div className="events__list">
                  {filtered.map((e) => (
                    <EventCard key={e.id} event={e} onSelect={setSelectedId} />
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
