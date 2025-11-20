const API_BASE = import.meta.env.VITE_API_URL || '/api'
const BASE_URL = `${API_BASE}/moby`

export async function searchMobyGames(query, limit = 10) {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(String(limit))}`
  const resp = await fetch(url, { method: 'GET' })
  if (!resp.ok) throw new Error('Error buscando juegos en MobyGames')
  return resp.json()
}

export async function getMobyGame(id, platformId) {
  const params = new URLSearchParams()
  params.set('id', String(id))
  if (platformId) params.set('platform_id', String(platformId))
  const url = `${BASE_URL}/game?${params.toString()}`
  const resp = await fetch(url, { method: 'GET' })
  if (!resp.ok) throw new Error('Error obteniendo detalles del juego en MobyGames')
  return resp.json()
}