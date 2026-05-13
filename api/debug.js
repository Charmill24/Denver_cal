export default async function handler(req, res) {
  const tests = [
    // SeatGeek - no auth
    'https://api.seatgeek.com/2/events?venue.city=Denver&datetime_local.gte=2026-05-29T00:00:00&datetime_local.lte=2026-05-29T23:59:59&per_page=3',
    // Ticketmaster open
    'https://app.ticketmaster.com/discovery/v2/events.json?city=Denver&stateCode=CO&startDateTime=2026-05-29T00:00:00Z&endDateTime=2026-05-29T23:59:59Z&apikey=test',
    // Predicthq public
    'https://api.predicthq.com/v1/events/?location_around.origin=39.7392,-104.9903&location_around.offset=10mi&start.gte=2026-05-29&start.lte=2026-05-29',
  ]

  const results = []
  for (const url of tests) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } })
      const text = await r.text()
      results.push({ url: url.split('?')[0], status: r.status, body: text.slice(0, 300) })
    } catch (e) {
      results.push({ url: url.split('?')[0], error: e.message })
    }
  }
  res.json(results)
}
