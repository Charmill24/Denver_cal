export default async function handler(req, res) {
  const date = req.query.date || '2026-05-15'

  const urls = [
    `https://visitdenver.com/events/calendar/?startDate=${date}&endDate=${date}`,
    `https://visitdenver.com/events/?startDate=${date}&endDate=${date}`,
    `https://visitdenver.com/events/?cat=&startDate=${date}`,
  ]

  const results = []

  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html',
        },
        redirect: 'follow',
      })
      const html = await r.text()

      // Look for JSON-LD event data
      const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      const jsonLds = jsonLdMatches.map(m => m[1].trim().slice(0, 500))

      // Look for class names containing "event" or "listing"
      const classMatches = [...html.matchAll(/class="([^"]*(?:event|listing|cal)[^"]*)"/gi)]
        .map(m => m[1])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 30)

      // Grab a 2000-char window around first "event" keyword
      const eventIdx = html.toLowerCase().indexOf('event-title')
      const snippet = eventIdx > 0 ? html.slice(Math.max(0, eventIdx - 200), eventIdx + 800) : 'NOT FOUND'

      results.push({
        url,
        status: r.status,
        finalUrl: r.url,
        length: html.length,
        jsonLdCount: jsonLds.length,
        jsonLdSamples: jsonLds.slice(0, 2),
        eventClasses: classMatches,
        snippetAroundEventTitle: snippet,
      })
    } catch (e) {
      results.push({ url, error: e.message })
    }
  }

  res.setHeader('Content-Type', 'application/json')
  res.json(results)
}
