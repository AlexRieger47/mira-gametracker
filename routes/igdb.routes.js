const express = require('express')
const axios = require('axios')

const router = express.Router()

const IGDB_API_BASE = 'https://api.igdb.com/v4'

function getIgdbHeaders() {
  const clientId = process.env.IGDB_CLIENT_ID
  const accessToken = process.env.IGDB_ACCESS_TOKEN
  return {
    'Client-ID': clientId,
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'text/plain',
  }
}

function buildCoverUrl(cover) {
  if (!cover || !cover.url) return null
  let url = cover.url
  if (url.startsWith('//')) url = 'https:' + url
  return url.replace('t_thumb', 't_cover_big')
}

function getReleaseYear(game) {
  if (!game || !game.first_release_date) return undefined
  try {
    return new Date(game.first_release_date * 1000).getFullYear()
  } catch (_) {
    return undefined
  }
}

function normalizeBasic(game) {
  return {
    id: game.id,
    title: game.name,
    releaseYear: getReleaseYear(game),
    platforms: Array.isArray(game.platforms)
      ? game.platforms.map(p => (typeof p === 'object' && p) ? (p.name || String(p.id || p)) : String(p))
      : [],
    genres: Array.isArray(game.genres)
      ? game.genres.map(g => (typeof g === 'object' && g) ? (g.name || String(g.id || g)) : String(g))
      : [],
    coverUrl: buildCoverUrl(game.cover),
  }
}

function pickDeveloper(game) {
  const companies = Array.isArray(game.involved_companies) ? game.involved_companies : []
  const dev = companies.find(ic => ic && ic.developer && ic.company && ic.company.name)
  if (dev && dev.company) return dev.company.name
  const first = companies.find(ic => ic && ic.company && ic.company.name)
  return first ? first.company.name : undefined
}

function normalizeDetails(game) {
  const basic = normalizeBasic(game)
  return {
    ...basic,
    descripcion: game.summary || game.storyline || '',
    desarrollador: pickDeveloper(game) || '',
    genero: basic.genres && basic.genres[0] ? basic.genres[0] : '',
    plataforma: basic.platforms && basic.platforms[0] ? basic.platforms[0] : '',
    añoLanzamiento: basic.releaseYear || undefined,
    titulo: basic.title || '',
    imagenPortada: basic.coverUrl || '',
  }
}

// GET /api/igdb/search?q=...&limit=10
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim()
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 20)
  const clientId = process.env.IGDB_CLIENT_ID
  const accessToken = process.env.IGDB_ACCESS_TOKEN

  if (!clientId || !accessToken) {
    return res.status(400).json({
      error: 'IGDB no configurado',
      details: 'Define IGDB_CLIENT_ID y IGDB_ACCESS_TOKEN en el archivo .env del backend.'
    })
  }

  if (!q) return res.json([])

  const query = [
    'fields name, cover.url, first_release_date, genres.name, platforms.name, involved_companies.company.name, involved_companies.developer;',
    `search "${q.replace(/"/g, '\\"')}";`,
    `limit ${limit};`
  ].join('\n')

  try {
    const { data } = await axios.post(`${IGDB_API_BASE}/games`, query, {
      headers: getIgdbHeaders(),
    })

    const suggestions = Array.isArray(data) ? data.map(normalizeBasic) : []
    res.json({ suggestions })
  } catch (err) {
    console.error('IGDB search error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Error buscando juegos en IGDB', details: err.message })
  }
})

// GET /api/igdb/game?id=...
router.get('/game', async (req, res) => {
  const id = parseInt(req.query.id, 10)
  const clientId = process.env.IGDB_CLIENT_ID
  const accessToken = process.env.IGDB_ACCESS_TOKEN

  if (!clientId || !accessToken) {
    return res.status(400).json({
      error: 'IGDB no configurado',
      details: 'Define IGDB_CLIENT_ID y IGDB_ACCESS_TOKEN en el archivo .env del backend.'
    })
  }

  if (!id) return res.status(400).json({ error: 'Falta parámetro id' })

  const query = [
    'fields name, cover.url, first_release_date, genres.name, platforms.name, involved_companies.company.name, involved_companies.developer, summary, storyline;',
    `where id = ${id};`,
    'limit 1;'
  ].join('\n')

  try {
    const { data } = await axios.post(`${IGDB_API_BASE}/games`, query, {
      headers: getIgdbHeaders(),
    })
    const game = Array.isArray(data) ? data[0] : null
    if (!game) return res.status(404).json({ error: 'Juego no encontrado en IGDB' })
    const details = normalizeDetails(game)
    res.json(details)
  } catch (err) {
    console.error('IGDB game error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Error obteniendo detalles del juego en IGDB', details: err.message })
  }
})

module.exports = router