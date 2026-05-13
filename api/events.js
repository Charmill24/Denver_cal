import { parse } from 'node-html-parser'

export default async function handler(req, res) {
  const { date } = req.query

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ events: [], error: 'Invalid date' })
  }

  try {
    const r = await fetch(`https://www.westword.com/eventsearch/?narrowByDate=${date}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    if (!r.ok) throw new Error(`Westword ${r.status}`)

    const html = await r.text()
    const root = parse(html)
    const items = root.querySelectorAll('.events-calendar__list-item')

    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const events = items.map((item, i) => {
      const titleEl = item.querySelector('.event-title a')
      const name = titleEl?.text?.trim() ?? ''
      const url = titleEl?.getAttribute('href') ?? ''

      const imgSrc = item.querySelector('.event-image img')?.getAttribute('src') ?? null
      const isPlaceholder = !imgSrc || imgSrc.includes('binary-viewer') || imgSrc.includes('placeholder')

      const occurrences = item.querySelector('.event-occurrences')?.text?.trim() ?? ''
      const venueName = item.querySelector('.event-location-name')?.text?.trim() ?? ''
      const venueAddr = item.querySelector('.event-location-address')?.text?.replace(/^,\s*/, '').trim() ?? ''
      const neighborhood = item.querySelector('.event-neighbourhood strong')?.text?.trim() ?? ''

      let time = null
      const parts = occurrences.split('|')
      const matchPart = parts.find(p => p.includes(monthDay)) ?? parts[0]
      const m = matchPart.match(/(\d+:\d+\s*[ap]m)/i)
      if (m) time = m[1].trim().replace(/\s*(am|pm)/i, s => ' ' + s.trim().toUpperCase())

      return {
        id: url.match(/\/event\/([^/]+)\//)?.[1] ?? String(i),
        name,
        date,
        time,
        venue: venueName,
        address: venueAddr,
        neighborhood,
        imageUrl: isPlaceholder ? null : imgSrc,
        url,
      }
    }).filter(e => e.name)

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.json({ events })
  } catch (err) {
    console.error('[api/events]', err)
    return res.status(500).json({ events: [], error: err.message })
  }
}
