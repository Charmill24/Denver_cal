import { parse } from 'node-html-parser'

export default async function handler(req, res) {
  const { date } = req.query

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ events: [], error: 'Invalid date' })
  }

  try {
    const r = await fetch(
      `https://visitdenver.com/denver365_com/api/events?date=${date}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Accept: 'text/html',
        },
      }
    )

    if (!r.ok) {
      return res.status(502).json({ events: [], error: `Upstream ${r.status}` })
    }

    const html = await r.text()
    const root = parse(html)

    // Format requested date to match the page's display format: "May 15"
    const [y, m, d] = date.split('-').map(Number)
    const targetLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    const events = []

    for (const item of root.querySelectorAll('.event-item')) {
      const titleEl = item.querySelector('h3 a')
      const dateEl  = item.querySelector('span.date')
      const venueEl = item.querySelector('p.venue a, p.venue')
      const descEl  = item.querySelector('p.description')
      const imgEl   = item.querySelector('img')
      const linkEl  = item.querySelector('a[href]')

      const name = titleEl?.text?.trim()
      if (!name) continue

      const eventDateLabel = dateEl?.text?.trim() ?? ''

      // Skip events that are explicitly dated but not for our requested day
      if (eventDateLabel && eventDateLabel !== targetLabel) continue

      // Fix blurry thumbnail → proper image
      let imageUrl = imgEl?.getAttribute('src') ?? null
      if (imageUrl) {
        imageUrl = imageUrl.replace(
          /\/image\/upload\/[^/]+\//,
          '/image/upload/c_fill,f_jpg,h_500,q_85,w_800/'
        )
      }

      const href = linkEl?.getAttribute('href') ?? ''
      const slug = href.split('/').filter(Boolean).pop() ?? ''

      events.push({
        id: slug || name.toLowerCase().replace(/\s+/g, '-'),
        name,
        date: eventDateLabel,
        venue: venueEl?.text?.trim() ?? '',
        description: descEl?.text?.trim() ?? '',
        imageUrl,
        url: href ? `https://visitdenver.com${href}` : 'https://visitdenver.com/events/',
      })
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.json({ events })
  } catch (err) {
    console.error('[api/events]', err)
    return res.status(500).json({ events: [], error: 'Failed to fetch events' })
  }
}
