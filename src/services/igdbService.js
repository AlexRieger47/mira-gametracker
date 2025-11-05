const BASE_URL = 'http://localhost:8000/api/igdb'

export async function searchIGDB(query, limit = 10) {
  const url = new URL(`${BASE_URL}/search`)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Error buscando juegos en IGDB')
  return resp.json()
}

export async function getIGDBGame(id) {
  const url = new URL(`${BASE_URL}/game`)
  url.searchParams.set('id', String(id))
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Error obteniendo detalles del juego en IGDB')
  return resp.json()
}