import { useEffect, useMemo, useState } from 'react'
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
import AccountModal from '../components/AccountModal.jsx'
import AddBusinessModal from '../components/AddBusinessModal.jsx'
import BusinessCard from '../components/BusinessCard.jsx'
import Onboarding from '../components/Onboarding.jsx'
import { useAuth, displayName, demoSignIn } from '../lib/auth.js'
import { isSaved } from '../lib/saved.js'
import { useBusinesses } from '../lib/businesses.js'
import { useLang } from '../lib/i18n.js'
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
  const [view, setView] = useState('map') // 'map' | 'calendar' | 'list'
  const [activeCat, setActiveCat] = useState('All')
  const [activeDate, setActiveDate] = useState(null)
  const [priceFilter, setPriceFilter] = useState(null) // 'Free' | 'Cost'
  const [audienceFilter, setAudienceFilter] = useState(null) // 'Kids' | 'Adults'
  const [savedFilter, setSavedFilter] = useState(false) // account-only: saved events only
  const [sortBy, setSortBy] = useState('Date')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { user, logOut } = useAuth()
  const { lang, setLang, t } = useLang()
  const [authOpen, setAuthOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [savedScreen, setSavedScreen] = useState(false) // dedicated saved-events screen
  const [savedTab, setSavedTab] = useState('next') // next | past
  const [addBizOpen, setAddBizOpen] = useState(false)
  const [bizScreen, setBizScreen] = useState(false) // My Local Business screen
  const { items: businesses, remove: removeBusiness } = useBusinesses()

  const resetFilters = () => {
    setActiveCat('All')
    setActiveDate(null)
    setPriceFilter(null)
    setAudienceFilter(null)
    setSavedFilter(false)
    setQuery('')
  }

  // Open a shared event link (?event=<id>) on first load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('event')
    if (id && EVENTS.some((e) => e.id === id)) setSelectedId(id)
    // preview helpers: ?demo=1 signs in; ?onboard=1 also shows the post-signup
    // tour; ?guest=1 signs out to view the logged-out state
    if (params.get('guest')) logOut()
    else if (params.get('demo') || params.get('onboard')) demoSignIn()
    if (params.get('onboard')) setOnboarding(true)
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
      const savedOk = !savedFilter || isSaved(e.seriesId || e.id)
      return catOk && qOk && dateOk && priceOk && audienceOk && savedOk
    })
  }, [activeCat, activeDate, priceFilter, audienceFilter, savedFilter, query, view])

  const handleLogout = () => {
    logOut()
    setSavedScreen(false)
    setBizScreen(false)
    setSavedFilter(false)
    setAccountOpen(false)
  }

  // Go to the events home (default view) — not the landing page.
  const goHome = () => {
    setBizScreen(false)
    setSavedScreen(false)
    setSelectedId(null)
    setSavedTab('next')
    setView('map')
    resetFilters()
  }

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
      {['map', 'calendar', 'list'].map((key) => (
        <button
          key={key}
          className={`tab ${!savedScreen && !bizScreen && view === key ? 'tab--active' : ''}`}
          onClick={() => {
            setSavedScreen(false)
            setBizScreen(false)
            setView(key)
          }}
        >
          {t(key)}
        </button>
      ))}
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
            <span className="filters__label">{t('when')}</span>
            <div className="filters__chips">
              {DATE_FILTERS.map((d) => (
                <button
                  key={d}
                  className={`chip ${activeDate === d ? 'chip--on-date' : ''}`}
                  onClick={() => setActiveDate(activeDate === d ? null : d)}
                >
                  {t(d)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="filters__group">
          <span className="filters__label">{t('category')}</span>
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
                {t(`cat_${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__label">{t('price')}</span>
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
                {t(`chip_${c.label}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__label">{t('goodFor')}</span>
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
                {t(`chip_${c.label}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__label" aria-hidden="true" />
          <div className="filters__chips">
            {user && (
              <button
                className="chip"
                aria-pressed={savedFilter}
                style={{
                  borderColor: '#d15a3a',
                  background: savedFilter ? hexToRgba('#d15a3a', 0.5) : undefined,
                }}
                onClick={() => setSavedFilter((s) => !s)}
              >
                <span className="badge__dot" style={{ background: '#d15a3a' }} />
                {t('savedChip')}
              </button>
            )}
            <button className="filters__clear" onClick={resetFilters}>
              {t('clearFilters')}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  const emptyState = (
    <div className="empty">
      <p className="empty__msg">
        {t('empty1')}
        <br />
        {t('empty2')}
        <br />
        {t('empty3')}
      </p>
      <EventCard event={EVENTS[0]} onSelect={setSelectedId} onRequireAuth={requireAuth} />
      <button className="empty__similar" onClick={resetFilters}>
        {t('seeSimilar')}
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
      <h1 className="events__logo" onClick={goHome} title="Home">
        ELP
      </h1>
      {user && (
        <span className="events__welcome">
          {t('welcome')} {displayName(user)}
        </span>
      )}
      <div className="events__actions">
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            className={`lang-toggle__btn ${lang === 'en' ? 'is-on' : ''}`}
            onClick={() => setLang('en')}
          >
            {t('langEN')}
          </button>
          <button
            className={`lang-toggle__btn ${lang === 'es' ? 'is-on' : ''}`}
            onClick={() => setLang('es')}
          >
            {t('langES')}
          </button>
        </div>
        {user && (
          <>
            <button
              className={`events__icon-btn ${savedScreen ? 'is-active' : ''}`}
              data-onb="saved"
              aria-label="Saved events"
              aria-pressed={savedScreen}
              title="Your saved events"
              onClick={() => {
                setSelectedId(null)
                setBizScreen(false)
                setSavedScreen((s) => !s)
              }}
            >
              <SavedIcon />
            </button>
          </>
        )}
        <button
          className="events__profile"
          data-onb="add"
          aria-label={user ? 'Account' : 'Log in or sign up'}
          title={user ? 'Account' : 'Log in / Sign up'}
          onClick={() => (user ? setAccountOpen(true) : setAuthOpen(true))}
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
      {accountOpen && (
        <AccountModal
          onClose={() => setAccountOpen(false)}
          onLogout={handleLogout}
          onBusinesses={() => {
            setAccountOpen(false)
            setSavedScreen(false)
            setSelectedId(null)
            setBizScreen(true)
          }}
        />
      )}
    </>
  )

  // ---------- My Local Business screen (storefront icon) ----------
  if (bizScreen) {
    return (
      <div className="events">
        {header}
        <h2 className="biz-screen__title">{t('myBusinesses')}</h2>
        <div className="biz-grid">
          {businesses.map((b) => (
            <BusinessCard key={b.id} biz={b} onRemove={removeBusiness} />
          ))}
          <button
            className="biz-card biz-card--add"
            onClick={() => setAddBizOpen(true)}
            aria-label={t('addBizTitle')}
            title={t('addBizTitle')}
          >
            <PlusBoxIcon width={38} height={38} />
            <span className="biz-card__add-label">{t('addBusinessShort')}</span>
          </button>
        </div>
        {overlays}
      </div>
    )
  }

  // ---------- Saved-events screen (folder icon) ----------
  if (savedScreen) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const q = query.trim().toLowerCase()
    const savedList = collapseSeries(
      EVENTS.filter((e) => isSaved(e.seriesId || e.id))
    ).filter(
      (e) =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
    )
    const shown = savedList
      .filter((e) => (savedTab === 'next' ? e.dateObj >= today : e.dateObj < today))
      .sort((a, b) =>
        savedTab === 'next' ? a.dateObj - b.dateObj : b.dateObj - a.dateObj
      )

    return (
      <div className="events">
        {header}
        <div className="events__controls">
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
            <button
              className={`tab ${savedTab === 'next' ? 'tab--active' : ''}`}
              onClick={() => setSavedTab('next')}
            >
              {t('nextEvents')}
            </button>
            <button
              className={`tab ${savedTab === 'past' ? 'tab--active' : ''}`}
              onClick={() => setSavedTab('past')}
            >
              {t('pastEvents')}
            </button>
          </div>
        </div>

        <div className={`list-layout ${selected ? 'list-layout--split' : ''}`}>
          <section className="list-panel">
            {shown.length === 0 ? (
              <p className="saved-empty">{t('noSaved')}</p>
            ) : (
              <div className="list-grid">
                {shown.map((e) => (
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

  // ---------- List view ----------
  if (view === 'list') {
    return (
      <div className="events">
        {header}
        <div className="events__controls">{controls}</div>

        <div className={`list-layout ${selected ? 'list-layout--split' : ''}`}>
          <section className="list-panel">
            <div className="list-panel__head">
              <h2 className="events__panel-title">{t('events')}</h2>
              <div className="sort">
                <span className="sort__label">{t('sortBy')}</span>
                <div className="seg">
                  {['Date', 'Price'].map((s) => (
                    <button
                      key={s}
                      className={`seg__btn ${sortBy === s ? 'seg__btn--active' : ''}`}
                      onClick={() => setSortBy(s)}
                    >
                      {s === 'Date' ? t('sortDate') : t('sortPrice')}
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
              <h2 className="events__panel-title">{t('events')}</h2>
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
