import { useState, useEffect, useCallback } from 'react'
import { fetchEventsByDate } from '../services/api.js'

const cache = new Map()

export function useEvents(date) {
  const [events, setEvents] = useState(cache.get(date) ?? [])
  const [loading, setLoading] = useState(!cache.has(date))
  const [error, setError] = useState(null)

  const load = useCallback(async (force = false) => {
    if (!force && cache.has(date)) {
      setEvents(cache.get(date))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEventsByDate(date)
      cache.set(date, data)
      setEvents(data)
    } catch (e) {
      setError('NETWORK')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { load() }, [load])

  return { events, loading, error, refresh: () => load(true) }
}
