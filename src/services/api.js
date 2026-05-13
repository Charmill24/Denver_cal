export async function fetchEventsByDate(date) {
  const res = await fetch(`/api/events?date=${date}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  if (json.needsKey) {
    const err = new Error('needs key')
    err.code = 'NEEDS_KEY'
    throw err
  }
  return json.events ?? []
}
