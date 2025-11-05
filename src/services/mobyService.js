const BASE_URL = 'http://localhost:8000/api/moby'

export async function searchMobyGames(query, limit = 10) {
  const url = new URL(`${BASE_URL}/search`)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', limit)
  const resp = await fetch(url, { method: 'GET' })
  if (!resp.ok) throw new Error('Error buscando juegos en MobyGames')
  return resp.json()
}

export async function getMobyGame(id, platformId) {
  const url = new URL(`${BASE_URL}/game`)
  url.searchParams.set('id', id)
  if (platformId) url.searchParams.set('platform_id', platformId)
  const resp = await fetch(url, { method: 'GET' })
  if (!resp.ok) throw new Error('Error obteniendo detalles del juego en MobyGames')
  return resp.json()
}