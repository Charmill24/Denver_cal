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
          <span className="text-7xl font-black text-[--primary] opacity-20">
            {event.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="p-4">
        <p className="text-[--text] font-bold text-[17px] leading-snug mb-2 line-clamp-2">
          {event.name}
        </p>
        {event.venue && (
          <p className="text-[--muted] text-sm mb-1">📍 {event.venue}</p>
        )}
        {event.description && (
          <p className="text-[--muted] text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </button>
  )
}
