export function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayString() {
  return toDateString(new Date())
}

export function formatLong(str) {
  return parseDate(str).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

export function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })
}

export function formatTime(time) {
  if (!time) return 'Time TBA'
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function getDateLabel(str) {
  const today = todayString()
  const tomorrow = toDateString(new Date(Date.now() + 86400000))
  if (str === today) return 'Today'
  if (str === tomorrow) return 'Tomorrow'
  return formatLong(str)
}

export function addDays(str, n) {
  const d = parseDate(str)
  d.setDate(d.getDate() + n)
  return toDateString(d)
}
