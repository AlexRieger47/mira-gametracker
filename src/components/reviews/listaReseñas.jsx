import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { GameContext } from '../../context/GameContext'
import {
  FaStar,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaEdit,
  FaTrash,
  FaGamepad,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaExclamationTriangle,
  FaEye,
  FaTimes
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import './ListaReseñas.css'

const ListaReseñas = () => {
  const {
    reseñas,
    juegos,
    cargarReseñas,
    cargarJuegos,
    eliminarReseña,
    loading,
    error
  } = useContext(GameContext)

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPuntuacion, setFilterPuntuacion] = useState('')
  const [filterDificultad, setFilterDificultad] = useState('')
  const [filterRecomendacion, setFilterRecomendacion] = useState('')
  const [sortBy, setSortBy] = useState('fechaCreacion')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Cargar datos una sola vez al montar el componente
  useEffect(() => {
    cargarReseñas()
    if (juegos.length === 0) {
      cargarJuegos()
    }
  }, [])

  // Función para obtener información del juego
  const getGameInfo = (juegoId) => {
    if (typeof juegoId === 'object' && juegoId._id) {
      return juegoId
    }
    return juegos.find(game => game._id === juegoId) || { titulo: 'Juego no encontrado' }
  }

  // Función para filtrar y ordenar reseñas
  const getFilteredAndSortedReviews = () => {
    let filteredReviews = [...reseñas]

    // Filtro por búsqueda
    if (searchTerm) {
      filteredReviews = filteredReviews.filter(review => {
        const gameInfo = getGameInfo(review.juegoId)
        return (
          gameInfo.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.textoReseña?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Filtro por puntuación
    if (filterPuntuacion) {
      filteredReviews = filteredReviews.filter(review =>
        review.puntuacion === parseInt(filterPuntuacion)
      )
    }

    // Filtro por dificultad
    if (filterDificultad) {
      filteredReviews = filteredReviews.filter(review =>
        review.dificultad === filterDificultad
      )
    }

    // Filtro por recomendación
    if (filterRecomendacion !== '') {
      const isRecommended = filterRecomendacion === 'true'
      filteredReviews = filteredReviews.filter(review =>
        review.recomendaria === isRecommended
      )
    }

    // Ordenamiento
    filteredReviews.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'puntuacion':
          aValue = a.puntuacion
          bValue = b.puntuacion
          break
        case 'horasJugadas':
          aValue = a.horasJugadas || 0
          bValue = b.horasJugadas || 0
          break
        case 'titulo':
          aValue = getGameInfo(a.juegoId).titulo?.toLowerCase() || ''
          bValue = getGameInfo(b.juegoId).titulo?.toLowerCase() || ''
          break
        case 'fechaCreacion':
        default:
          aValue = new Date(a.fechaCreacion || a.createdAt)
          bValue = new Date(b.fechaCreacion || b.createdAt)
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filteredReviews
  }

  // Manejar eliminación de reseña
  const handleDeleteReview = async (reviewId) => {
    try {
      await eliminarReseña(reviewId)
      toast.success('Reseña eliminada correctamente')
      setDeleteConfirm(null)
    } catch (error) {
      toast.error('Error al eliminar la reseña')
    }
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setFilterPuntuacion('')
    setFilterDificultad('')
    setFilterRecomendacion('')
    setSortBy('fechaCreacion')
    setSortOrder('desc')
  }

  // Renderizar estrellas
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
      />
    ))
  }

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredReviews = getFilteredAndSortedReviews()

  if (loading) {
    return (
      <div className="lista-reseñas">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando reseñas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lista-reseñas">
        <div className="error-container">
          <h2>Error al cargar las reseñas</h2>
          <p>{error}</p>
          <button onClick={cargarReseñas} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lista-reseñas">
      {/* Header */}
      <div className="reviews-header">
        <div className="header-content">
          <div className="header-info">
            <h1>
              <FaStar className="header-icon" />
              Mis Reseñas
            </h1>
            <p>Gestiona y revisa todas tus reseñas de juegos</p>
          </div>

          <Link to="/agregar-resena" className="btn btn-primary">
            <FaPlus />
            Nueva Reseña
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-number">{reseñas.length}</div>
            <div className="stat-label">Total Reseñas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reseñas.length > 0
                ? (reseñas.reduce((sum, r) => sum + r.puntuacion, 0) / reseñas.length).toFixed(1)
                : '0'
              }
            </div>
            <div className="stat-label">Puntuación Media</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reseñas.filter(r => r.recomendaria).length}
            </div>
            <div className="stat-label">Recomendados</div>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="controls-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por juego o contenido de reseña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="controls-buttons">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
          >
            <FaFilter />
            Filtros
          </button>

          <div className="sort-container">
            <FaSort className="sort-icon" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="sort-select"
            >
              <option value="fechaCreacion-desc">Más recientes</option>
              <option value="fechaCreacion-asc">Más antiguos</option>
              <option value="puntuacion-desc">Mayor puntuación</option>
              <option value="puntuacion-asc">Menor puntuación</option>
              <option value="titulo-asc">Título A-Z</option>
              <option value="titulo-desc">Título Z-A</option>
              <option value="horasJugadas-desc">Más horas jugadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Puntuación</label>
              <select
                value={filterPuntuacion}
                onChange={(e) => setFilterPuntuacion(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Dificultad</label>
              <select
                value={filterDificultad}
                onChange={(e) => setFilterDificultad(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Muy Fácil">Muy Fácil</option>
                <option value="Fácil">Fácil</option>
                <option value="Media">Media</option>
                <option value="Difícil">Difícil</option>
                <option value="Muy Difícil">Muy Difícil</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Recomendación</label>
              <select
                value={filterRecomendacion}
                onChange={(e) => setFilterRecomendacion(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="true">Recomendados</option>
                <option value="false">No recomendados</option>
              </select>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="btn btn-secondary">
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información de resultados */}
      <div className="results-info">
        <span>
          Mostrando {filteredReviews.length} de {reseñas.length} reseñas
        </span>
      </div>

      {/* Lista de reseñas */}
      <div className="reviews-container">
        {filteredReviews.length === 0 ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>
              {reseñas.length === 0
                ? 'No tienes reseñas aún'
                : 'No se encontraron reseñas'
              }
            </h3>
            <p>
              {reseñas.length === 0
                ? 'Comienza agregando tu primera reseña de un juego'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {reseñas.length === 0 && (
              <Link to="/agregar-resena" className="btn btn-primary">
                <FaPlus />
                Agregar Primera Reseña
              </Link>
            )}
          </div>
        ) : (
          <div className="reviews-grid">
            {filteredReviews.map(review => {
              const gameInfo = getGameInfo(review.juegoId)

              return (
                <div key={review._id} className="review-card">
                  {/* Header de la tarjeta */}
                  <div className="review-header">
                    <div className="game-info">
                      {gameInfo.imagenPortada && (
                        <img
                          src={gameInfo.imagenPortada}
                          alt={gameInfo.titulo}
                          className="game-thumbnail"
                        />
                      )}
                      <div className="game-details">
                        <h3 className="game-title">{gameInfo.titulo}</h3>
                        <p className="game-meta">
                          {gameInfo.desarrollador} • {gameInfo.añoLanzamiento}
                        </p>
                      </div>
                    </div>

                    <div className="review-actions">
                      <Link
                        to={`/editar-resena/${review._id}`}
                        className="action-btn edit"
                        title="Editar reseña"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(review._id)}
                        className="action-btn delete"
                        title="Eliminar reseña"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Puntuación y recomendación */}
                  <div className="review-rating">
                    <div className="stars-container">
                      {renderStars(review.puntuacion)}
                      <span className="rating-text">({review.puntuacion}/5)</span>
                    </div>

                    <div className="recommendation">
                      {review.recomendaria ? (
                        <span className="recommended">
                          <FaThumbsUp />
                          Recomendado
                        </span>
                      ) : (
                        <span className="not-recommended">
                          <FaThumbsDown />
                          No recomendado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenido de la reseña */}
                  {review.textoReseña && (
                    <div className="review-content">
                      <p>{review.textoReseña}</p>
                    </div>
                  )}

                  {/* Metadatos */}
                  <div className="review-meta">
                    <div className="meta-item">
                      <FaClock />
                      <span>{review.horasJugadas || 0}h jugadas</span>
                    </div>
                    <div className="meta-item">
                      <FaExclamationTriangle />
                      <span>{review.dificultad}</span>
                    </div>
                    <div className="meta-item">
                      <span className="review-date">
                        {formatDate(review.fechaCreacion || review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar esta reseña?</p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>

            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                <FaTimes />
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteReview(deleteConfirm)}
                className="btn btn-danger"
              >
                <FaTrash />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListaReseñas