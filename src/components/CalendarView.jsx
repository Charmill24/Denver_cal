import { useState } from 'react'
import { toDateString, parseDate, formatMonthYear, todayString, getDateLabel } from '../utils/dateUtils.js'
import { useEvents } from '../hooks/useEvents.js'
import EventCard from './EventCard.jsx'

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function buildGrid(year, month) {
  const first = new Date(year, month, 1).getDay()
  const last = new Date(year, month + 1, 0).getDate()
  const cells = Array(first).fill(null)
  for (let d = 1; d <= last; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function CalendarView({ onEventClick }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(toDateString(now))
  const { events, loading } = useEvents(selectedDate)
  const today = todayString()

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }
  function selectDay(day) {
    const m = String(viewMonth + 1).padStart(2, '0')
    setSelectedDate(`${viewYear}-${m}-${String(day).padStart(2, '0')}`)
  }

  const grid = buildGrid(viewYear, viewMonth)
  const selDay = parseDate(selectedDate).getDate()
  const selInView = parseDate(selectedDate).getFullYear() === viewYear &&
    parseDate(selectedDate).getMonth() === viewMonth

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="m-4 bg-[--card] border border-[--border] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl text-[--text] active:bg-[--surface] text-xl">‹</button>
          <span className="text-[--text] font-bold">{formatMonthYear(viewYear, viewMonth)}</span>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl text-[--text] active:bg-[--surface] text-xl">›</button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DOW.map(d => (
            <span key={d} className="text-center text-[--muted] text-[11px] font-semibold">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((day, i) => {
            if (!day) return <div key={i} />
            const m = String(viewMonth + 1).padStart(2, '0')
            const dateStr = `${viewYear}-${m}-${String(day).padStart(2, '0')}`
            const isTod = dateStr === today
            const isSel = selInView && day === selDay
            const isPast = dateStr < today
            return (
              <button
                key={i}
                onClick={() => selectDay(day)}
                className={`aspect-square flex items-center justify-center rounded-full text-[15px] font-medium
                  ${isSel ? 'bg-[--primary] text-white font-bold' : ''}
                  ${isTod && !isSel ? 'border border-[--primary] text-[--primary] font-bold' : ''}
                  ${isPast && !isSel ? 'text-[--dim]' : ''}
                  ${!isSel && !isTod && !isPast ? 'text-[--text]' : ''}
                  active:bg-[--surface]`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-[--text] text-lg font-extrabold mb-3">{getDateLabel(selectedDate)}</h2>
        {loading && <p className="text-[--muted] text-sm text-center py-8">Loading…</p>}
        {!loading && events.length === 0 && (
          <p className="text-[--muted] text-sm text-center py-8">Nothing scheduled this day</p>
        )}
        {events.map(e => <EventCard key={e.id} event={e} onClick={() => onEventClick(e)} />)}
        <div className="h-6" />
      </div>
    </div>
  )
}
