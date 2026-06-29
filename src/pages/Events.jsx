import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './Events.css'
import { EVENTS } from '../data/events.js'
import { CATEGORY_ORDER, categoryColor, ALL_COLOR } from '../data/categories.js'
import MapView from '../components/MapView.jsx'
import EventCard from '../components/EventCard.jsx'
import EventDetail from '../components/EventDetail.jsx'
import { SearchIcon, ScanFaceIcon } from '../components/icons.jsx'

const DATE_FILTERS = ['Today', 'This Weekend', 'This Week']

export default function Events() {
  const navigate = useNavigate()
  const [activeCat, setActiveCat] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EVENTS.filter((e) => {
      const catOk = activeCat === 'All' || e.category === activeCat
      const qOk =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
      return catOk && qOk
    })
  }, [activeCat, query])

  const selected = EVENTS.find((e) => e.id === selectedId) || null

  return (
    <div className="events">
      <header className="events__header">
        <h1
          className="events__logo"
          onClick={() => navigate('/')}
          title="Back to home"
        >
          ELP
        </h1>
        <button className="events__profile" aria-label="Profile">
          <ScanFaceIcon />
        </button>
      </header>

      <div className="events__layout">
        {/* Left: controls + map */}
        <section className="events__main">
          <div className="searchbar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Sunland Park"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="tabs">
            <button className="tab tab--active">Map</button>
            <button className="tab" title="Coming soon">Calendar</button>
            <button className="tab" title="Coming soon">List</button>
          </div>

          <div className="filters">
            <span className="filters__label">Filter by:</span>
            <div className="filters__rows">
              <div className="filters__row">
                {DATE_FILTERS.map((d) => (
                  <button key={d} className="chip chip--date">
                    {d}
                  </button>
                ))}
              </div>
              <div className="filters__row">
                {CATEGORY_ORDER.map((c) => (
                  <button
                    key={c}
                    className={`chip ${activeCat === c ? 'chip--active' : ''}`}
                    style={{ borderColor: categoryColor(c) }}
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
                  className={`chip chip--all ${activeCat === 'All' ? 'chip--active' : ''}`}
                  style={{ borderColor: ALL_COLOR }}
                  onClick={() => setActiveCat('All')}
                >
                  <span className="badge__dot" style={{ background: ALL_COLOR }} />
                  All
                </button>
              </div>
            </div>
          </div>

          <div className="map-wrap">
            <MapView
              events={filtered}
              selectedId={selectedId}
              onSelectPin={setSelectedId}
            />
          </div>
        </section>

        {/* Right: events list OR detail */}
        <aside className="events__panel">
          {selected ? (
            <EventDetail event={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <>
              <h2 className="events__panel-title">Events:</h2>
              <div className="events__list">
                {filtered.length === 0 && (
                  <p className="events__empty">No events match your filters.</p>
                )}
                {filtered.map((e) => (
                  <EventCard key={e.id} event={e} onSelect={setSelectedId} />
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
