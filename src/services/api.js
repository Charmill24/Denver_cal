export async function fetchEventsByDate(date) {
  const res = await fetch(`/api/events?date=${date}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const { events, error } = await res.json()
  if (error && !events?.length) throw new Error(error)
  return events ?? []
}
