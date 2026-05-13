export default async function handler(req, res) {
  const { date } = req.query

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ events: [], error: 'Invalid date' })
  }

  const apiKey = process.env.TICKETMASTER_KEY
  if (!apiKey) {
    return res.status(200).json({ events: [], needsKey: true })
  }

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      city: 'Denver',
      stateCode: 'CO',
      countryCode: 'US',
      startDateTime: `${date}T00:00:00Z`,
      endDateTime: `${date}T23:59:59Z`,
      size: '50',
      sort: 'date,asc',
    })

    const r = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`)
    if (!r.ok) throw new Error(`Ticketmaster ${r.status}`)

    const data = await r.json()

    const events = (data._embedded?.events ?? []).map(e => {
      const venue = e._embedded?.venues?.[0]
      const cls = e.classifications?.[0]
      const price = e.priceRanges?.[0]
      const imgs = e.images ?? []
      const img = imgs.filter(i => i.ratio === '16_9').sort((a, b) => b.width - a.width)[0] ?? imgs[0]

      return {
        id: e.id,
        name: e.name,
        date: e.dates?.start?.localDate,
        time: e.dates?.start?.localTime,
        venue: venue?.name ?? 'Denver',
        address: venue?.address?.line1,
        imageUrl: img?.url ?? null,
        category: cls?.segment?.name,
        genre: cls?.genre?.name,
        priceMin: price?.min ?? null,
        url: e.url,
      }
    })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.json({ events })
  } catch (err) {
    console.error('[api/events]', err)
    return res.status(500).json({ events: [], error: err.message })
  }
}
