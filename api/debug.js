export default async function handler(req, res) {
  const date = req.query.date || '2026-05-15'
  try {
    const r = await fetch(
      `https://visitdenver.com/denver365_com/api/events?date=${date}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
      }
    )
    const html = await r.text()
    res.setHeader('Content-Type', 'text/plain')
    res.send(`STATUS: ${r.status}\nLENGTH: ${html.length}\n\n--- FIRST 3000 CHARS ---\n${html.slice(0, 3000)}`)
  } catch (e) {
    res.status(500).send(`ERROR: ${e.message}`)
  }
}
