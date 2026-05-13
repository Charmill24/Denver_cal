export async function fetchEventsByDate(date) {
  const res = await fetch(`/api/events?date=${date}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  return json.events ?? []
}
