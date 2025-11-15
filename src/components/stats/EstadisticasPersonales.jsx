import { useState, useEffect, useContext } from 'react'
import { GameContext } from '../../context/GameContext'
import {
  FaChartBar,
  FaGamepad,
  FaStar,
  FaClock,
  FaTrophy,
  FaCalendarAlt,
  FaThumbsUp,
  FaExclamationTriangle,
  FaDesktop,
  FaUsers,
  FaFire,
  FaHeart
} from 'react-icons/fa'
import './EstadisticasPersonales.css'

const EstadisticasPersonales = () => {
  const {
    juegos,
    reseñas,
    cargarJuegos,
    cargarReseñas,
    loading
  } = useContext(GameContext)

  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedView, setSelectedView] = useState('overview')

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarJuegos()
    cargarReseñas()
  }, [])

  // Función para filtrar por período
  const filterByPeriod = (items, dateField = 'fechaCreacion') => {
    if (selectedPeriod === 'all') return items

    const now = new Date()
    const periods = {
      'week': 7,
      'month': 30,
      'year': 365
    }

    const daysAgo = periods[selectedPeriod]
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))

    return items.filter(item => {
      const itemDate = new Date(item[dateField] || item.createdAt)
      return itemDate >= cutoffDate
    })
  }

  // Estadísticas generales
  const getGeneralStats = () => {
    const filteredGames = filterByPeriod(juegos)
    const filteredReviews = filterByPeriod(reseñas)

    const completedGames = filteredGames.filter(juego => juego.completado)
    const totalHours = filteredReviews.reduce((sum, reseña) => sum + (reseña.horasJugadas || 0), 0)
    const avgRating = filteredReviews.length > 0
      ? filteredReviews.reduce((sum, reseña) => sum + reseña.puntuacion, 0) / filteredReviews.length
      : 0
    const recommendedGames = filteredReviews.filter(reseña => reseña.recomendaria)

    return {
      totalGames: filteredGames.length,
      completedGames: completedGames.length,
      pendingGames: filteredGames.length - completedGames.length,
      totalReviews: filteredReviews.length,
      totalHours: totalHours,
      avgRating: avgRating,
      recommendedGames: recommendedGames.length,
      completionRate: filteredGames.length > 0 ? (completedGames.length / filteredGames.length) * 100 : 0
    }
  }

  // Estadísticas por género
  const getGenreStats = () => {
    const filteredGames = filterByPeriod(juegos)
    const genreCount = {}
    const genreHours = {}
    const genreRatings = {}

    filteredGames.forEach(juego => {
      const genre = juego.genero || 'Sin género'
      genreCount[genre] = (genreCount[genre] || 0) + 1

      // Buscar reseña del juego
      const review = reseñas.find(r =>
        (r.juegoId._id || r.juegoId) === juego._id
      )

      if (review) {
        genreHours[genre] = (genreHours[genre] || 0) + (review.horasJugadas || 0)

        if (!genreRatings[genre]) {
          genreRatings[genre] = []
        }
        genreRatings[genre].push(review.puntuacion)
      }
    })

    return Object.keys(genreCount).map(genre => ({
      genre,
      count: genreCount[genre],
      hours: genreHours[genre] || 0,
      avgRating: genreRatings[genre]
        ? genreRatings[genre].reduce((a, b) => a + b, 0) / genreRatings[genre].length
        : 0
    })).sort((a, b) => b.count - a.count)
  }

  // Estadísticas por plataforma
  const getPlatformStats = () => {
    const filteredGames = filterByPeriod(juegos)
    const platformCount = {}

    filteredGames.forEach(juego => {
      const platform = juego.plataforma || 'Sin plataforma'
      platformCount[platform] = (platformCount[platform] || 0) + 1
    })

    return Object.keys(platformCount).map(platform => ({
      platform,
      count: platformCount[platform]
    })).sort((a, b) => b.count - a.count)
  }

  // Estadísticas por año
  const getYearStats = () => {
    const filteredGames = filterByPeriod(juegos)
    const yearCount = {}

    filteredGames.forEach(juego => {
      const year = juego.añoLanzamiento || 'Desconocido'
      yearCount[year] = (yearCount[year] || 0) + 1
    })

    return Object.keys(yearCount).map(year => ({
      year,
      count: yearCount[year]
    })).sort((a, b) => b.year - a.year).slice(0, 10)
  }

  // Estadísticas de dificultad
  const getDifficultyStats = () => {
    const filteredReviews = filterByPeriod(reseñas)
    const difficultyCount = {}

    filteredReviews.forEach(review => {
      const difficulty = review.dificultad || 'Sin especificar'
      difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1
    })

    return Object.keys(difficultyCount).map(difficulty => ({
      difficulty,
      count: difficultyCount[difficulty]
    })).sort((a, b) => b.count - a.count)
  }

  // Juegos más jugados
  const getMostPlayedGames = () => {
    const filteredReviews = filterByPeriod(reseñas)

    return filteredReviews
      .filter(review => review.horasJugadas > 0)
      .map(review => {
        const gameInfo = typeof review.juegoId === 'object'
          ? review.juegoId
          : juegos.find(j => j._id === review.juegoId)

        return {
          ...review,
          gameInfo
        }
      })
      .sort((a, b) => (b.horasJugadas || 0) - (a.horasJugadas || 0))
      .slice(0, 5)
  }

  // Mejores juegos calificados
  const getTopRatedGames = () => {
    const filteredReviews = filterByPeriod(reseñas)

    return filteredReviews
      .filter(review => review.puntuacion >= 4)
      .map(review => {
        const gameInfo = typeof review.juegoId === 'object'
          ? review.juegoId
          : juegos.find(j => j._id === review.juegoId)

        return {
          ...review,
          gameInfo
        }
      })
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 5)
  }

  const generalStats = getGeneralStats()
  const genreStats = getGenreStats()
  const platformStats = getPlatformStats()
  const yearStats = getYearStats()
  const difficultyStats = getDifficultyStats()
  const mostPlayedGames = getMostPlayedGames()
  const topRatedGames = getTopRatedGames()

  if (loading) {
    return (
      <div className="estadisticas-personales">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="estadisticas-personales">
      {/* Header */}
      <div className="stats-header">
        <div className="header-content">
          <div className="header-info">
            <h1>
              <FaChartBar className="header-icon" />
              Estadísticas Personales
            </h1>
            <p>Analiza tu actividad gaming y descubre patrones interesantes</p>
          </div>
        </div>

        {/* Controles */}
        <div className="stats-controls">
          <div className="period-selector">
            <label>Período:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">Todo el tiempo</option>
              <option value="year">Último año</option>
              <option value="month">Último mes</option>
              <option value="week">Última semana</option>
            </select>
          </div>

          <div className="view-selector">
            <button
              className={`view-btn ${selectedView === 'overview' ? 'active' : ''}`}
              onClick={() => setSelectedView('overview')}
            >
              Resumen
            </button>
            <button
              className={`view-btn ${selectedView === 'detailed' ? 'active' : ''}`}
              onClick={() => setSelectedView('detailed')}
            >
              Detallado
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="main-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaGamepad />
          </div>
          <div className="stat-content">
            <div className="stat-number">{generalStats.totalGames}</div>
            <div className="stat-label">Juegos en Biblioteca</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <div className="stat-number">{generalStats.completedGames}</div>
            <div className="stat-label">Juegos Completados</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-number">{generalStats.totalHours.toFixed(1)}h</div>
            <div className="stat-label">Horas Jugadas</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{generalStats.avgRating.toFixed(1)}</div>
            <div className="stat-label">Puntuación Media</div>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">
            <FaThumbsUp />
          </div>
          <div className="stat-content">
            <div className="stat-number">{generalStats.recommendedGames}</div>
            <div className="stat-label">Juegos Recomendados</div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <FaHeart />
          </div>
          <div className="stat-content">
            <div className="stat-number">{generalStats.completionRate.toFixed(1)}%</div>
            <div className="stat-label">Tasa de Finalización</div>
          </div>
        </div>
      </div>

      {/* Vista detallada */}
      {selectedView === 'detailed' && (
        <div className="detailed-stats">
          {/* Estadísticas por género */}
          <div className="stats-section">
            <h2>
              <FaFire className="section-icon" />
              Géneros Favoritos
            </h2>
            <div className="genre-stats">
              {genreStats.slice(0, 6).map(stat => (
                <div key={stat.genre} className="genre-card">
                  <div className="genre-header">
                    <h3>{stat.genre}</h3>
                    <span className="genre-count">{stat.count} juegos</span>
                  </div>
                  <div className="genre-details">
                    <div className="genre-detail">
                      <FaClock />
                      <span>{stat.hours.toFixed(1)}h</span>
                    </div>
                    {stat.avgRating > 0 && (
                      <div className="genre-detail">
                        <FaStar />
                        <span>{stat.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas por plataforma */}
          <div className="stats-section">
            <h2>
              <FaDesktop className="section-icon" />
              Plataformas
            </h2>
            <div className="platform-stats">
              {platformStats.map(stat => (
                <div key={stat.platform} className="platform-item">
                  <span className="platform-name">{stat.platform}</span>
                  <div className="platform-bar">
                    <div
                      className="platform-fill"
                      style={{
                        width: `${(stat.count / Math.max(...platformStats.map(s => s.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="platform-count">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas de dificultad */}
          <div className="stats-section">
            <h2>
              <FaExclamationTriangle className="section-icon" />
              Dificultad de Juegos
            </h2>
            <div className="difficulty-stats">
              {difficultyStats.map(stat => (
                <div key={stat.difficulty} className="difficulty-item">
                  <span className="difficulty-name">{stat.difficulty}</span>
                  <span className="difficulty-count">{stat.count} reseñas</span>
                </div>
              ))}
            </div>
          </div>

          {/* Juegos más jugados */}
          <div className="stats-section">
            <h2>
              <FaClock className="section-icon" />
              Juegos Más Jugados
            </h2>
            <div className="top-games">
              {mostPlayedGames.map((review, index) => (
                <div key={review._id} className="top-game-item">
                  <div className="game-rank">#{index + 1}</div>
                  <div className="game-info">
                    {review.gameInfo?.imagenPortada && (
                      <img
                        src={review.gameInfo.imagenPortada}
                        alt={review.gameInfo.titulo}
                        className="game-thumbnail"
                      />
                    )}
                    <div className="game-details">
                      <h4>{review.gameInfo?.titulo || 'Juego desconocido'}</h4>
                      <p>{review.gameInfo?.desarrollador}</p>
                    </div>
                  </div>
                  <div className="game-stats">
                    <div className="game-hours">
                      <FaClock />
                      {review.horasJugadas}h
                    </div>
                    <div className="game-rating">
                      <FaStar />
                      {review.puntuacion}/5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mejores juegos calificados */}
          <div className="stats-section">
            <h2>
              <FaStar className="section-icon" />
              Mejores Juegos Calificados
            </h2>
            <div className="top-games">
              {topRatedGames.map((review, index) => (
                <div key={review._id} className="top-game-item">
                  <div className="game-rank">#{index + 1}</div>
                  <div className="game-info">
                    {review.gameInfo?.imagenPortada && (
                      <img
                        src={review.gameInfo.imagenPortada}
                        alt={review.gameInfo.titulo}
                        className="game-thumbnail"
                      />
                    )}
                    <div className="game-details">
                      <h4>{review.gameInfo?.titulo || 'Juego desconocido'}</h4>
                      <p>{review.gameInfo?.desarrollador}</p>
                    </div>
                  </div>
                  <div className="game-stats">
                    <div className="game-rating">
                      <FaStar />
                      {review.puntuacion}/5
                    </div>
                    {review.recomendaria && (
                      <div className="game-recommended">
                        <FaThumbsUp />
                        Recomendado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {juegos.length === 0 && reseñas.length === 0 && (
        <div className="empty-state">
          <FaChartBar className="empty-icon" />
          <h3>No hay datos para mostrar</h3>
          <p>Agrega algunos juegos y reseñas para ver tus estadísticas personales</p>
        </div>
      )}
    </div>
  )
}

export default EstadisticasPersonales