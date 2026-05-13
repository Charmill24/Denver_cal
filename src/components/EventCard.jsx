import { useState } from 'react'

export default function EventCard({ event, onClick }) {
  const [imgErr, setImgErr] = useState(false)

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
          <span className="text-7xl font-black opacity-20 text-[--primary]">
            {event.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="p-4">
        {event.neighborhood && (
          <div className="mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-[--primary]" style={{ background: 'rgba(91,158,245,0.16)' }}>
              {event.neighborhood}
            </span>
          </div>
        )}
        <p className="text-[--text] font-bold text-[17px] leading-snug mb-2 line-clamp-2">
          {event.name}
        </p>
        {event.venue && <p className="text-[--muted] text-sm mb-1">📍 {event.venue}</p>}
        {event.time && <p className="text-[--muted] text-sm">🕐 {event.time}</p>}
      </div>
    </button>
  )
}
