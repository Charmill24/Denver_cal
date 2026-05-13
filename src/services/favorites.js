const KEY = 'denver_favorites'

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function toggleFavorite(event) {
  const favs = loadFavorites()
  const idx = favs.findIndex(f => f.id === event.id)
  if (idx >= 0) {
    favs.splice(idx, 1)
  } else {
    favs.unshift(event)
  }
  localStorage.setItem(KEY, JSON.stringify(favs))
  return { favorites: favs, saved: idx < 0 }
}

export function isFavorite(id) {
  return loadFavorites().some(f => f.id === id)
}
