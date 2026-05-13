export default async function handler(req, res) {
  const { date } = req.query

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ events: [], error: 'Invalid date' })
  }

  try {
    const params = new URLSearchParams({
      'venue.city': 'Denver',
      'venue.state': 'CO',
      'datetime_local.gte': `${date}T00:00:00`,
      'datetime_local.lte': `${date}T23:59:59`,
      sort: 'datetime_local.asc',
      per_page: '50',
    })

    const r = await fetch(`https://api.seatgeek.com/2/events?${params}`)

    if (!r.ok) {
      return res.status(502).json({ events: [], error: `SeatGeek ${r.status}` })
    }

    const data = await r.json()

    const events = (data.events ?? []).map(e => {
      const performer = e.performers?.[0]
      const image = performer?.image ?? e.performers?.find(p => p.image)?.image ?? null

      return {
        id: String(e.id),
        name: e.title,
        date: e.datetime_local
          ? new Date(e.datetime_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date,
        time: e.datetime_tbd ? null : e.datetime_local?.split('T')[1]?.slice(0, 5),
        venue: e.venue?.name ?? 'Denver',
        address: e.venue?.address,
        imageUrl: image,
        category: e.type ? e.type.charAt(0).toUpperCase() + e.type.slice(1) : null,
        priceMin: e.stats?.lowest_price ?? null,
        url: e.url,
        description: null,
      }
    })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.json({ events })
  } catch (err) {
    console.error('[api/events]', err)
    return res.status(500).json({ events: [], error: err.message })
  }
}
