import { useRef, useEffect } from 'react'
import { toDateString, todayString } from '../utils/dateUtils.js'

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DAYS = 30

function getDays() {
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return { str: toDateString(d), name: DOW[d.getDay()], num: d.getDate() }
  })
}

export default function DayStrip({ selected, onSelect }) {
  const days = getDays()
  const today = todayString()
  const ref = useRef(null)

  useEffect(() => {
    const idx = days.findIndex(d => d.str === selected)
    if (idx > 1 && ref.current) {
      ref.current.scrollLeft = (idx - 1) * 60
    }
  }, [selected])

  return (
    <div
      ref={ref}
      className="flex overflow-x-auto px-3 py-3 gap-1 scroll-smooth"
      style={{ scrollbarWidth: 'none' }}
    >
      {days.map(({ str, name, num }, i) => {
        const sel = str === selected
        return (
          <button
            key={str}
            onClick={() => onSelect(str)}
            className={`flex-shrink-0 w-14 flex flex-col items-center py-2.5 rounded-2xl transition-colors ${
              sel
                ? 'bg-[--primary] text-white'
                : 'text-[--muted] hover:bg-[--surface] active:bg-[--surface]'
            }`}
          >
            <span className="text-[10px] font-bold tracking-wide mb-1.5">
              {i === 0 ? 'TODAY' : name}
            </span>
            <span className={`text-xl font-bold ${sel ? 'text-white' : 'text-[--text]'}`}>
              {num}
            </span>
            {i === 0 && !sel && (
              <span className="w-1 h-1 rounded-full bg-[--primary] mt-1" />
            )}
          </button>
        )
      })}
    </div>
  )
}
