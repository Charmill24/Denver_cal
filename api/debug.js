import { parse } from 'node-html-parser'

export default async function handler(req, res) {
  const date = req.query.date || '2026-05-15'

  const url = `https://visitdenver.com/events/?startDate=${date}&endDate=${date}`

  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    redirect: 'follow',
  })

  const html = await r.text()
  const root = parse(html)

  // 1. JSON-LD structured data
  const jsonLds = root.querySelectorAll('script[type="application/ld+json"]')
    .map(s => { try { return JSON.parse(s.text) } catch { return null } })
    .filter(Boolean)

  // 2. Unique class names containing event/listing/cal
  const classNames = [...new Set(
    [...html.matchAll(/class="([^"]+)"/g)]
      .flatMap(m => m[1].split(' '))
      .filter(c => /event|listing|cal-|card/i.test(c))
  )].slice(0, 50)

  // 3. Snippet around the word "event" near an <a href
  const idx = html.indexOf('/event/')
  const snippet = idx > 0 ? html.slice(Math.max(0, idx - 300), idx + 600) : 'no /event/ href found'

  // 4. All hrefs containing /event/
  const eventHrefs = [...new Set(
    [...html.matchAll(/href="(\/event\/[^"]+)"/g)].map(m => m[1])
  )].slice(0, 10)

  res.json({
    status: r.status,
    finalUrl: r.url,
    htmlLength: html.length,
    jsonLdCount: jsonLds.length,
    jsonLdTypes: jsonLds.map(j => j['@type'] || j.type || '?'),
    jsonLdSample: jsonLds[0] || null,
    eventClassNames: classNames,
    eventHrefs,
    snippetAroundFirstEventHref: snippet,
  })
}
