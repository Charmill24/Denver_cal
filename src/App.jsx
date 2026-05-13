import { useState } from 'react'
import { todayString, getDateLabel } from './utils/dateUtils.js'
import { useEvents } from './hooks/useEvents.js'
import { loadFavorites } from './services/favorites.js'
import DayStrip from './components/DayStrip.jsx'
import EventCard from './components/EventCard.jsx'
import EventDetail from './components/EventDetail.jsx'
import CalendarView from './components/CalendarView.jsx'

// ─── Icons ───────────────────────────────────────────────────────────────────
function CalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
function HeartIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

// ─── Events tab ───────────────────────────────────────────────────────────────
function EventsScreen({ onEventClick }) {
  const [selected, setSelected] = useState(todayString())
  const { events, loading, error, refresh } = useEvents(selected)

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-4 pb-1 flex-shrink-0">
        <p className="text-[--primary] text-xs font-bold tracking-widest uppercase">Denver, CO</p>
        <h1 className="text-[--text] text-2xl font-extrabold mt-0.5">{getDateLabel(selected)}</h1>
      </div>
      <DayStrip selected={selected} onSelect={setSelected} />
      <div className="flex-1 overflow-y-auto px-4 pt-2">
        {loading && (
          <p className="text-[--muted] text-sm text-center py-16">Finding events…</p>
        )}
        {!loading && error === 'NEEDS_KEY' && (
          <div className="m-2 p-5 bg-[--card] border border-[--border] rounded-2xl text-center">
            <p className="text-3xl mb-3">🔑</p>
            <p className="text-[--text] font-bold mb-2">One quick setup step</p>
            <p className="text-[--muted] text-sm leading-relaxed mb-4">
              Add a free Ticketmaster API key in your Vercel dashboard to see live Denver events.
            </p>
            <p className="text-[--muted] text-xs leading-relaxed">
              1. Get a free key at <span className="text-[--primary]">developer.ticketmaster.com</span>{'\n'}
              2. In Vercel → Settings → Environment Variables{'\n'}
              3. Add <span className="text-[--accent] font-mono">TICKETMASTER_KEY</span> = your key{'\n'}
              4. Redeploy
            </p>
          </div>
        )}
        {!loading && error === 'NETWORK' && (
          <p className="text-[--muted] text-sm text-center py-16">📡 Couldn't load events</p>
        )}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🏔️</p>
            <p className="text-[--text] font-bold">Nothing on {getDateLabel(selected)}</p>
            <p className="text-[--muted] text-sm mt-1">Try a different day</p>
          </div>
        )}
        {events.map(e => <EventCard key={e.id} event={e} onClick={() => onEventClick(e)} />)}
        <div className="h-4" />
      </div>
    </div>
  )
}

// ─── Saved tab ────────────────────────────────────────────────────────────────
function SavedScreen({ onEventClick }) {
  const [favs] = useState(() => loadFavorites())
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-4 pb-4 flex-shrink-0 flex justify-between items-baseline">
        <h1 className="text-[--text] text-2xl font-extrabold">Saved</h1>
        {favs.length > 0 && <span className="text-[--muted] text-sm">{favs.length} saved</span>}
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        {favs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">❤️</p>
            <p className="text-[--text] font-bold">No saved events yet</p>
            <p className="text-[--muted] text-sm mt-1">Tap the heart on any event to save it</p>
          </div>
        ) : (
          favs.map(e => <EventCard key={e.id} event={e} onClick={() => onEventClick(e)} />)
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'events',   label: 'Events',  Icon: () => <CalIcon /> },
  { id: 'calendar', label: 'Browse',  Icon: () => <GridIcon /> },
  { id: 'saved',    label: 'Saved',   Icon: ({ active }) => <HeartIcon filled={active} /> },
]

function BottomNav({ active, onChange }) {
  return (
    <nav
      className="flex-shrink-0 flex bg-[--surface] border-t border-[--border]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const on = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${on ? 'text-[--primary]' : 'text-[--dim]'}`}
          >
            <Icon active={on} />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('events')
  const [savedKey, setSavedKey] = useState(0)
  const [detail, setDetail] = useState(null)

  function closeDetail() {
    if (tab === 'saved') setSavedKey(k => k + 1)
    setDetail(null)
  }

  return (
    <div
      className="flex flex-col bg-[--bg] text-[--text] overflow-hidden"
      style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {detail ? (
        <EventDetail event={detail} onBack={closeDetail} />
      ) : (
        <>
          <div className="flex-1 min-h-0">
            {tab === 'events'   && <EventsScreen onEventClick={setDetail} />}
            {tab === 'calendar' && <CalendarView onEventClick={setDetail} />}
            {tab === 'saved'    && <SavedScreen key={savedKey} onEventClick={setDetail} />}
          </div>
          <BottomNav active={tab} onChange={setTab} />
        </>
      )}
    </div>
  )
}
