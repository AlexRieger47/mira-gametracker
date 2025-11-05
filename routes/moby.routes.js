const express = require('express');
const axios = require('axios');

const router = express.Router()

// Helpers
const pickYear = (game) => {
  // Intentar primero first_release_year; fallback a first_release date o primero de todos los lanzamientos
  if (game.first_release_year) return game.first_release_year
  if (game.first_release_date) {
    const y = new Date(game.first_release_date).getFullYear()
    if (!isNaN(y)) return y
  }
  if (Array.isArray(game.platforms) && game.platforms.length > 0) {
    const years = []
    game.platforms.forEach(p => {
      if (p.first_release_year) years.push(p.first_release_year)
        if (p.first_release_date) {
          const y = new Date(p.first_release_date).getFullYear()
          if (!isNaN(y)) years.push(y)
        }
    })
    if (years.length > 0) return Math.min(...years)
  }
return null
}

const genreToSpanish = (name) => {
  if (!name) return null
  const map = {
      'Action': 'Acción',
      'Adventure': 'Aventura',
      'Role-Playing (RPG)': 'RPG',
      'Strategy/Tactics': 'Estrategia',
      'Simulation': 'Simulación',
      'Sports': 'Deportes',
      'Racing/Driving': 'Carreras',
      'Puzzle': 'Puzzle',
      'Platform': 'Plataformas',
      'Shooter': 'Shooter',
      'Horror': 'Terror',
      'Survival': 'Supervivencia',
      'Indie': 'Indie',
      'Multiplayer': 'Multijugador',
      'Other': 'Otro'
  }
  return map[name] || name
}

const platformToLocal = (name) => {
  if (!name) return null
  const map = {
    'Windows': 'PC',
    'PC': 'PC',
    'PlayStation 5': 'PlayStation 5',
    'PlayStation 4': 'PlayStation 4',
    'Xbox Series X/S': 'Xbox Series X/S',
    'Xbox One': 'Xbox One',
    'Nintendo Switch': 'Nintendo Switch',
    'iOS': 'Mobile',
    'Android': 'Mobile',
    'Web': 'Web'
  }
  return map[name] || name
}

const MOBY_API_BASE = 'https://api.mobygames.com/v1'

// GET /api/moby/search?q=...&limit=10
router.get('/search', async (req, res) => {
  try {
    const {q, limit = 10} = req.query
    if (!q || String(q).trim().length < 2) {
      return res.status(400).json({error: 'El parámetro "q" es requerido y debe tener al menos 2 caracteres'})
    }

  const apiKey = process.env.MOBY_API_KEY
  if (!apiKey) {
    // Modo Demo
    const demo = {
      suggestions: [
        {
          id: 20581,
            title: 'Phoenix Wright: Ace Attorney',
            platforms: [
              { id: null, name: 'Nintendo DS' },
              { id: null, name: 'iPhone' },
              { id: null, name: 'Wii' }
            ],
            year: 2005
        }
      ]
    }
    return res.json(demo)
  }

    const { data } = await axios.get(`${MOBY_API_BASE}/games`, {
      params: {
        api_key: apiKey,
        title: q,
        format: 'brief',
        limit: Math.min(Number(limit) || 10, 25)
      }
    })

    const suggestions = (data.games || []).map(g => ({
      id: g.game_id || g.id || null,
      title: g.title,
      platforms: (g.platforms || []).map(p => ({ id: p.platform_id, name: p.platform_name})),
      year: pickYear(g)
    }))
    return res.json({ suggestions })
  } catch (err) {
    res.status(500).json({error: 'Error buscando juegos en MobyGames', details: err.message})
  }

})

// GET /api/moby/game?id= ...&platformid=...
router.get('/game', async (req, res) => {
  try {
    const {id, platform_id} = req.query
    if (!id) return res.status(400).json({error: 'El parámetro "id" es requerido'})

      const apiKey = process.env.MOBY_API_KEY
      // Modo demo: si no hay API key, devolvemos datos mínimos
      if (!apiKey) {
        return res.json({
          titulo: 'Phoenix Wright: Ace Attorney',
          genero: 'Aventura',
          plataforma: 'Nintendo DS',
          añoLanzamiento: 2005,
          desarrollador: 'Capcom',
          imagenPortada: '', // Requiere API para extraer el enlace directo
          descripcion: 'Phoenix Wright: Ace Attorney es una novela visual de investigación y juicios, con casos que combinan exploración, interrogatorios y resolución de puzzles.'
        })
      }

      // 1) Obtener datos completos del juego
    const detailsResp = await axios.get(`${MOBY_API_BASE}/games`, {
      params: {
        api_key: apiKey,
        id: id,
        format: 'normal'
      }
    })
    const game = (detailsResp.data.games || [])[0]
    if (!game) return res.status(404).json({ error: 'Juego no encontrado en MobyGames' })

    const titulo = game.title
    const añoLanzamiento = pickYear(game)
    const genero = genreToSpanish((game.genres && game.genres[0] && game.genres[0].genre_name) || null)

    // Desarrollador: intentar compañías con rol desarrollador
    let desarrollador = null
    if (Array.isArray(game.companies)) {
      const dev = game.companies.find(c =>
        (c.role && /developer/i.test(c.role)) || (c.company_role && /developer/i.test(c.company_role))
      )
      desarrollador = dev ? (dev.company_name || dev.name) : null
    }

    // Seleccionar plataforma
    let platformId = platform_id ? Number(platform_id) : null
    let plataformaName = null
    if (!platformId && Array.isArray(game.platforms) && game.platforms.length > 0) {
      platformId = game.platforms[0].platform_id
      plataformaName = game.platforms[0].platform_name
    } else if (platformId && Array.isArray(game.platforms)) {
      const match = game.platforms.find(p => p.platform_id === platformId)
      if (match) plataformaName = match.platform_name
    }

    // 2) Obtener portada, si hay plataforma
    let imagenPortada = ''
    if (platformId) {
      try {
        const coversResp = await axios.get(`${MOBY_API_BASE}/games/${id}/platforms/${platformId}/covers`, {
          params: { api_key: apiKey }
        })
        const covers = coversResp.data.covers || coversResp.data || []
        const front = covers.find(c => {
          const type = (c.type || c.cover_type || '').toLowerCase()
          return type.includes('front')
        }) || covers[0]
        if (front) {
          imagenPortada = front.image || front.image_url || front.url || ''
        }
      } catch (e) {
        // continuar sin portada
      }
    }

    res.json({
      titulo,
      genero,
      plataforma: platformToLocal(plataformaName) || plataformaName || '',
      añoLanzamiento: añoLanzamiento || new Date().getFullYear(),
      desarrollador: desarrollador || '',
      imagenPortada: imagenPortada || '',
      descripcion: game.description || game.brief_description || ''
    })
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo detalles del juego en MobyGames', details: err.message })
  }
})

module.exports = router