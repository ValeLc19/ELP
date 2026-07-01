import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './Events.css'
import { EVENTS } from '../data/events.js'
import {
  CATEGORY_ORDER,
  categoryColor,
  categoryTint,
  hexToRgba,
} from '../data/categories.js'
import MapView from '../components/MapView.jsx'
import CalendarView from '../components/CalendarView.jsx'
import EventCard from '../components/EventCard.jsx'
import EventDetail from '../components/EventDetail.jsx'
import AuthModal from '../components/AuthModal.jsx'
import AddBusinessModal from '../components/AddBusinessModal.jsx'
import Onboarding from '../components/Onboarding.jsx'
import { useAuth, displayName, demoSignIn } from '../lib/auth.js'
import { isSaved } from '../lib/saved.js'
import {
  SearchIcon,
  ScanFaceIcon,
  PlusBoxIcon,
  SavedIcon,
} from '../components/icons.jsx'

const DATE_FILTERS = ['Today', 'This Weekend', 'This Week']

const PRICE_CHIPS = [
  { label: 'Free', val: 'Free', color: '#e0a83e' },
  { label: 'Paid', val: 'Paid', color: '#2e8b57' },
]
const AUDIENCE_CHIPS = [
  { label: 'Kids', val: 'Kids', color: '#d36fa6' },
  { label: '18+', val: 'Adults', color: '#e08a7b' },
]

const isFree = (e) => /free/i.test(e.price)

// Collapse recurring series to a single representative instance — the soonest
// upcoming occurrence (or the most recent past one if all are over). Used for
// the Map and List so a weekly event shows once instead of 13 times.
function collapseSeries(list) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = today.getTime()
  const groups = new Map()
  for (const e of list) {
    const key = e.seriesId || e.id
    const cur = groups.get(key)
    if (!cur) {
      groups.set(key, e)
      continue
    }
    const fa = e.dateObj.getTime()
    const fb = cur.dateObj.getTime()
    const aUp = fa >= t
    const bUp = fb >= t
    let better
    if (aUp && bUp) better = fa <= fb ? e : cur
    else if (aUp) better = e
    else if (bUp) better = cur
    else better = fa >= fb ? e : cur
    groups.set(key, better)
  }
  return [...groups.values()]
}

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
    // The upcoming Saturday and Sunday.
    const daysToSat = (6 - win.today.getDay() + 7) % 7
    const sat = addDays(win.today, daysToSat)
    const sun = addDays(sat, 1)
    return d.getTime() === sat.getTime() || d.getTime() === sun.getTime()
  }
  return true
}

export default function Events() {
  const navigate = useNavigate()
  const [view, setView] = useState('map') // 'map' | 'calendar' | 'list'
  const [activeCat, setActiveCat] = useState('All')
  const [activeDate, setActiveDate] = useState(null)
  const [priceFilter, setPriceFilter] = useState(null) // 'Free' | 'Cost'
  const [audienceFilter, setAudienceFilter] = useState(null) // 'Kids' | 'Adults'
  const [sortBy, setSortBy] = useState('Date')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { user, logOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [savedOnly, setSavedOnly] = useState(false)
  const [addBizOpen, setAddBizOpen] = useState(false)

  const resetFilters = () => {
    setActiveCat('All')
    setActiveDate(null)
    setPriceFilter(null)
    setAudienceFilter(null)
    setQuery('')
  }

  // Open a shared event link (?event=<id>) on first load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('event')
    if (id && EVENTS.some((e) => e.id === id)) setSelectedId(id)
    if (params.get('demo')) demoSignIn() // preview the signed-in state
  }, [])

  // Keep the URL in sync with the open event so it's always shareable.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (selectedId) url.searchParams.set('event', selectedId)
    else url.searchParams.delete('event')
    window.history.replaceState({}, '', url)
  }, [selectedId])

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
      const priceOk =
        !priceFilter ||
        (priceFilter === 'Free' ? isFree(e) : !isFree(e))
      const audienceOk =
        !audienceFilter ||
        (audienceFilter === 'Kids' ? e.family : !!e.ageNote)
      const savedOk = !savedOnly || isSaved(e.seriesId || e.id)
      return catOk && qOk && dateOk && priceOk && audienceOk && savedOk
    })
  }, [activeCat, activeDate, priceFilter, audienceFilter, query, view, savedOnly])

  // Saving requires an account — open the auth modal if logged out.
  const requireAuth = () => {
    if (!user) {
      setAuthOpen(true)
      return false
    }
    return true
  }

  // Map and List show one card/pin per series; the calendar keeps every date.
  const collapsed = useMemo(() => collapseSeries(filtered), [filtered])

  const sorted = useMemo(() => {
    const arr = collapsed.slice()
    arr.sort((a, b) =>
      sortBy === 'Price'
        ? priceValue(a.price) - priceValue(b.price)
        : a.dateObj - b.dateObj
    )
    return arr
  }, [collapsed, sortBy])

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
        {view !== 'calendar' && (
          <div className="filters__group">
            <span className="filters__label">When</span>
            <div className="filters__chips">
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
          </div>
        )}

        <div className="filters__group">
          <span className="filters__label">Category</span>
          <div className="filters__chips">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                className="chip"
                style={{
                  borderColor: categoryColor(c),
                  background: activeCat === c ? categoryTint(c, 0.55) : undefined,
                }}
                onClick={() => setActiveCat(activeCat === c ? 'All' : c)}
              >
                <span
                  className="badge__dot"
                  style={{ background: categoryColor(c) }}
                />
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__label">Price</span>
          <div className="filters__chips">
            {PRICE_CHIPS.map((c) => (
              <button
                key={c.val}
                className="chip"
                style={{
                  borderColor: c.color,
                  background:
                    priceFilter === c.val ? hexToRgba(c.color, 0.55) : undefined,
                }}
                onClick={() =>
                  setPriceFilter(priceFilter === c.val ? null : c.val)
                }
              >
                <span className="badge__dot" style={{ background: c.color }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__label">Good for</span>
          <div className="filters__chips">
            {AUDIENCE_CHIPS.map((c) => (
              <button
                key={c.val}
                className="chip"
                style={{
                  borderColor: c.color,
                  background:
                    audienceFilter === c.val ? hexToRgba(c.color, 0.55) : undefined,
                }}
                onClick={() =>
                  setAudienceFilter(audienceFilter === c.val ? null : c.val)
                }
              >
                <span className="badge__dot" style={{ background: c.color }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__label" aria-hidden="true" />
          <button className="filters__clear" onClick={resetFilters}>
            Clear filters
          </button>
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
      <EventCard event={EVENTS[0]} onSelect={setSelectedId} onRequireAuth={requireAuth} />
      <button className="empty__similar" onClick={resetFilters}>
        See similar events
      </button>
    </div>
  )

  const detailPanel = (
    <EventDetail
      event={selected}
      onBack={() => setSelectedId(null)}
      onRequireAuth={requireAuth}
    />
  )

  const header = (
    <header className="events__header">
      <h1 className="events__logo" onClick={() => navigate('/')} title="Back to home">
        ELP
      </h1>
      {user && <span className="events__welcome">Welcome {displayName(user)}</span>}
      <div className="events__actions">
        {user && (
          <>
            <button
              className="events__icon-btn"
              aria-label="Add a business"
              title="Add a local business to pull in their events"
              onClick={() => setAddBizOpen(true)}
            >
              <PlusBoxIcon />
            </button>
            <button
              className={`events__icon-btn ${savedOnly ? 'is-active' : ''}`}
              aria-label="Saved events"
              aria-pressed={savedOnly}
              title="Your saved events"
              onClick={() => setSavedOnly((s) => !s)}
            >
              <SavedIcon />
            </button>
          </>
        )}
        <button
          className="events__profile"
          aria-label={user ? 'Account' : 'Log in or sign up'}
          title={user ? 'Log out' : 'Log in / Sign up'}
          onClick={() => (user ? logOut() : setAuthOpen(true))}
        >
          <ScanFaceIcon />
        </button>
      </div>
    </header>
  )

  const overlays = (
    <>
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignedUp={() => {
            setAuthOpen(false)
            setOnboarding(true)
          }}
        />
      )}
      {onboarding && <Onboarding onDone={() => setOnboarding(false)} />}
      {addBizOpen && <AddBusinessModal onClose={() => setAddBizOpen(false)} />}
    </>
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
                    onRequireAuth={requireAuth}
                  />
                ))}
              </div>
            )}
          </section>

          {selected && <aside className="events__panel">{detailPanel}</aside>}
        </div>
        {overlays}
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
                  events={collapsed}
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
              {collapsed.length === 0 ? (
                emptyState
              ) : (
                <div className="events__list">
                  {sorted.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      onSelect={setSelectedId}
                      onRequireAuth={requireAuth}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
      {overlays}
    </div>
  )
}
