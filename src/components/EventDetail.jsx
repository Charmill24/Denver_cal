import { useState } from 'react'
import { isFavorite, toggleFavorite } from '../services/favorites.js'

export default function EventDetail({ event, onBack }) {
  const [imgErr, setImgErr] = useState(false)
  const [saved, setSaved] = useState(() => isFavorite(event.id))

  function handleSave() {
    const { saved: s } = toggleFavorite(event)
    setSaved(s)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="relative flex-shrink-0">
        {event.imageUrl && !imgErr ? (
          <img
            src={event.imageUrl}
            alt=""
            className="w-full object-cover"
            style={{ height: 260 }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full bg-[--surface] flex items-center justify-center" style={{ height: 260 }}>
            <span className="text-8xl font-black text-[--primary] opacity-20">
              {event.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,14,26,0.55) 0%, transparent 45%)' }} />
        <div className="absolute top-0 left-0 right-0 flex justify-between px-4 pt-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white text-xl"
          >
            ←
          </button>
          <button
            onClick={handleSave}
            className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-xl"
          >
            {saved ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          <h1 className="text-[--text] text-2xl font-extrabold leading-tight mb-4">
            {event.name}
          </h1>

          <div className="bg-[--card] border border-[--border] rounded-2xl px-4 mb-4 divide-y divide-[--border]">
            {event.time && (
              <div className="flex items-center py-3.5 gap-3.5">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="text-[--muted] text-[11px] font-semibold uppercase tracking-wide mb-0.5">Time</p>
                  <p className="text-[--text] text-sm font-medium">{event.time}</p>
                </div>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center py-3.5 gap-3.5">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-[--muted] text-[11px] font-semibold uppercase tracking-wide mb-0.5">Venue</p>
                  <p className="text-[--text] text-sm font-medium">{event.venue}{event.address ? ` · ${event.address}` : ''}</p>
                </div>
              </div>
            )}
            {event.neighborhood && (
              <div className="flex items-center py-3.5 gap-3.5">
                <span className="text-lg">🗺️</span>
                <div>
                  <p className="text-[--muted] text-[11px] font-semibold uppercase tracking-wide mb-0.5">Neighborhood</p>
                  <p className="text-[--text] text-sm font-medium">{event.neighborhood}</p>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="bg-[--card] border border-[--border] rounded-2xl p-4 mb-4">
              <p className="text-[--text] font-bold mb-2 text-sm">About this event</p>
              <p className="text-[--muted] text-sm leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div
        className="p-4 border-t border-[--border] bg-[--bg] flex-shrink-0"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[--primary] text-white font-bold text-base py-4 rounded-2xl"
        >
          View on Westword ↗
        </a>
      </div>
    </div>
  )
}
