const API_BASE = import.meta.env.VITE_API_URL || '/api'
const BASE_URL = `${API_BASE}/igdb`

export async function searchIGDB(query, limit = 10) {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(String(limit))}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Error buscando juegos en IGDB')
  return resp.json()
}

export async function getIGDBGame(id) {
  const url = `${BASE_URL}/game?id=${encodeURIComponent(String(id))}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Error obteniendo detalles del juego en IGDB')
  return resp.json()
}