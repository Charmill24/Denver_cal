import { useState } from 'react'

const CAT_COLORS = {
  concert: '#5B9EF5', music: '#5B9EF5',
  sports: '#34D399', sport: '#34D399',
  theater: '#A78BFA', theatre: '#A78BFA',
  comedy: '#F97316',
  family: '#FBBF24',
  film: '#F472B6',
}

function catColor(cat) {
  return CAT_COLORS[cat?.toLowerCase()] ?? '#F5A623'
}

function formatTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function EventCard({ event, onClick }) {
  const [imgErr, setImgErr] = useState(false)
  const color = catColor(event.category)
  const time = formatTime(event.time)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[--card] border border-[--border] rounded-2xl overflow-hidden mb-3 active:scale-[0.98] transition-transform"
    >
      {event.imageUrl && !imgErr ? (
        <img
          src={event.imageUrl}
          alt=""
          className="w-full h-44 object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="w-full h-44 bg-[--surface] flex items-center justify-center">
          <span className="text-7xl font-black opacity-20" style={{ color }}>
            {event.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          {event.category && (
            <span
              className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ color, background: color + '28' }}
            >
              {event.category}
            </span>
          )}
          {event.priceMin != null && (
            <span className="text-[--accent] font-bold text-sm ml-auto">
              ${Math.round(event.priceMin)}+
            </span>
          )}
        </div>
        <p className="text-[--text] font-bold text-[17px] leading-snug mb-2 line-clamp-2">
          {event.name}
        </p>
        {event.venue && <p className="text-[--muted] text-sm mb-1">📍 {event.venue}</p>}
        {time && <p className="text-[--muted] text-sm">🕐 {time}</p>}
      </div>
    </button>
  )
}
