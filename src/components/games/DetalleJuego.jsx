import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { GameContext } from '../../context/GameContext'
import {
  FaGamepad,
  FaEdit,
  FaTrash,
  FaStar,
  FaCalendarAlt,
  FaDesktop,
  FaUsers,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaExclamationTriangle,
  FaArrowLeft,
  FaPlus,
  FaCheckCircle,
  FaCircle,
  FaTimes,
  FaHeart,
  FaShare
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import './DetalleJuego.css'

const DetalleJuego = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    juegos,
    reseñas,
    obtenerJuego,
    eliminarJuego,
    toggleGameCompletion,
    cargarReseñas,
    eliminarReseña,
    loading
  } = useContext(GameContext)

  const [game, setGame] = useState(null)
  const [gameReview, setGameReview] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isLoadingGame, setIsLoadingGame] = useState(true)

  // Cargar datos del juego
  useEffect(() => {
    const loadGameData = async () => {
      setIsLoadingGame(true)
      try {
        // Buscar en el estado local primero
        let juegoData = juegos.find(j => j._id === id)

        if (!juegoData) {
          // Si no está en el estado local, hacer petición al backend
          juegoData = await obtenerJuego(id)
        }

        if (juegoData) {
          setGame(juegoData)

          // Buscar reseña del juego
          const review = reseñas.find(r =>
            (r.juegoId._id || r.juegoId) === id
          )
          setGameReview(review)
        } else {
          toast.error('Juego no encontrado')
          navigate('/biblioteca')
        }
      } catch (error) {
        toast.error('Error al cargar el juego')
        navigate('/biblioteca')
      } finally {
        setIsLoadingGame(false)
      }
    }

    if (id) {
      loadGameData()
    }
  }, [id, juegos, reseñas, obtenerJuego, navigate])

  // Cargar reseñas si no están cargadas
  useEffect(() => {
    if (reseñas.length === 0) {
      cargarReseñas()
    }
  }, [])

  // Manejar eliminación del juego
  const handleDeleteGame = async () => {
    try {
      await eliminarJuego(id)
      toast.success('Juego eliminado correctamente')
      navigate('/biblioteca')
    } catch (error) {
      toast.error('Error al eliminar el juego')
    }
  }

  // Manejar eliminación de reseña
  const handleDeleteReview = async () => {
    try {
      await eliminarReseña(gameReview._id)
      setGameReview(null)
      toast.success('Reseña eliminada correctamente')
      setDeleteConfirm(null)
    } catch (error) {
      toast.error('Error al eliminar la reseña')
    }
  }

  // Manejar cambio de estado de completado
  const handleToggleCompletion = async () => {
    try {
      const updatedGame = await toggleGameCompletion(id)
      setGame(updatedGame)
      toast.success(
        updatedGame.completado
          ? 'Juego marcado como completado'
          : 'Juego marcado como pendiente'
      )
    } catch (error) {
      toast.error('Error al actualizar el estado del juego')
    }
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
      month: 'long',
      day: 'numeric'
    })
  }

  // Obtener color del género
  const getGenreColor = (genre) => {
    const colors = {
      'Acción': '#8E2A2A',
      'Aventura': '#D97A2B',
      'RPG': '#725A7E',
      'Estrategia': '#3EA6A1',
      'Simulación': '#5A5D7E',
      'Deportes': '#4D9E53',
      'Carreras': '#D95F1A',
      'Puzzle': '#C05A8A',
      'Plataformas': '#A4C84D',
      'Shooter': '#2E3C50',
      'Terror': '#3A3A3A',
      'Supervivencia': '#486B4A',
      'Indie': '#7E5A6C',
      'Multijugador': '#5A7E76',
      'Otro': '#5A617E'
    }
    // Color fallback por si los colores fallan
    const fallback = '#6E6E6E'
    return colors[genre] || fallback
  }

  if (isLoadingGame || loading) {
    return (
      <div className="detalle-juego">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando información del juego...</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="detalle-juego">
        <div className="error-container">
          <h2>Juego no encontrado</h2>
          <p>El juego que buscas no existe o ha sido eliminado.</p>
          <Link to="/biblioteca" className="btn btn-primary">
            <FaArrowLeft />
            Volver a la Biblioteca
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="detalle-juego">
      {/* Header con navegación */}
      <div className="game-header">
        <div className="header-navigation">
          <button
            onClick={() => navigate('/biblioteca')}
            className="back-btn"
          >
            <FaArrowLeft />
            Volver a la Biblioteca
          </button>

          <div className="header-actions">
            <button
              onClick={handleToggleCompletion}
              className={`completion-btn ${game.completado ? 'completed' : 'pending'}`}
              title={game.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
            >
              {game.completado ? <FaCheckCircle /> : <FaCircle />}
              {game.completado ? 'Completado' : 'Pendiente'}
            </button>

            <Link
              to={`/editar-juego/${game._id}`}
              className="action-btn edit"
              title="Editar juego"
            >
              <FaEdit />
            </Link>

            <button
              onClick={() => setDeleteConfirm('game')}
              className="action-btn delete"
              title="Eliminar juego"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>

      {/* Información principal del juego */}
      <div className="game-main-info">
        <div className="game-cover">
          {game.imagenPortada ? (
            <img
              src={game.imagenPortada}
              alt={game.titulo}
              className="cover-image"
            />
          ) : (
            <div className="cover-placeholder">
              <FaGamepad />
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        <div className="game-details">
          <div className="game-title-section">
            <h1 className="game-title">{game.titulo}</h1>
            <div className="game-badges">
              <span
                className="genre-badge"
                style={{ backgroundColor: getGenreColor(game.genero) }}
              >
                {game.genero}
              </span>
              {game.completado && (
                <span className="completed-badge">
                  <FaCheckCircle />
                  Completado
                </span>
              )}
            </div>
          </div>

          <div className="game-meta">
            <div className="meta-item">
              <FaUsers className="meta-icon" />
              <span><strong>Desarrollador:</strong> {game.desarrollador}</span>
            </div>
            <div className="meta-item">
              <FaCalendarAlt className="meta-icon" />
              <span><strong>Año:</strong> {game.añoLanzamiento}</span>
            </div>
            <div className="meta-item">
              <FaDesktop className="meta-icon" />
              <span><strong>Plataforma:</strong> {game.plataforma}</span>
            </div>
            <div className="meta-item">
              <FaCalendarAlt className="meta-icon" />
              <span><strong>Agregado:</strong> {formatDate(game.fechaCreacion || game.createdAt)}</span>
            </div>
          </div>

          {game.descripcion && (
            <div className="game-description">
              <h3>Descripción</h3>
              <p>{game.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección de reseña */}
      <div className="review-section">
        <div className="section-header">
          <h2>
            <FaStar className="section-icon" />
            Mi Reseña
          </h2>

          {gameReview ? (
            <div className="review-actions">
              <Link
                to={`/editar-resena/${gameReview._id}`}
                className="btn btn-secondary"
              >
                <FaEdit />
                Editar Reseña
              </Link>
              <button
                onClick={() => setDeleteConfirm('review')}
                className="btn btn-danger"
              >
                <FaTrash />
                Eliminar Reseña
              </button>
            </div>
          ) : (
            <Link
              to={`/agregar-resena?juego=${game._id}`}
              className="btn btn-primary"
            >
              <FaPlus />
              Agregar Reseña
            </Link>
          )}
        </div>

        {gameReview ? (
          <div className="review-content">
            {/* Puntuación y recomendación */}
            <div className="review-rating">
              <div className="rating-display">
                <div className="stars-container">
                  {renderStars(gameReview.puntuacion)}
                </div>
                <span className="rating-text">
                  {gameReview.puntuacion}/5 estrellas
                </span>
              </div>

              <div className="recommendation">
                {gameReview.recomendaria ? (
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

            {/* Metadatos de la reseña */}
            <div className="review-meta">
              <div className="meta-item">
                <FaClock />
                <span>{gameReview.horasJugadas || 0} horas jugadas</span>
              </div>
              <div className="meta-item">
                <FaExclamationTriangle />
                <span>Dificultad: {gameReview.dificultad}</span>
              </div>
              <div className="meta-item">
                <FaCalendarAlt />
                <span>Reseñado el {formatDate(gameReview.fechaCreacion || gameReview.createdAt)}</span>
              </div>
            </div>

            {/* Texto de la reseña */}
            {gameReview.textoReseña && (
              <div className="review-text">
                <h4>Mi opinión</h4>
                <p>{gameReview.textoReseña}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="no-review">
            <FaStar className="no-review-icon" />
            <h3>Aún no has reseñado este juego</h3>
            <p>Comparte tu experiencia y opinión sobre este juego</p>
          </div>
        )}
      </div>

      {/* Acciones adicionales */}
      <div className="additional-actions">
        <div className="action-group">
          <h3>Acciones</h3>
          <div className="action-buttons">
            <button className="action-button">
              <FaHeart />
              <span>Agregar a Favoritos</span>
            </button>
            <button className="action-button">
              <FaShare />
              <span>Compartir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>
              {deleteConfirm === 'game'
                ? `¿Estás seguro de que quieres eliminar "${game.titulo}"?`
                : '¿Estás seguro de que quieres eliminar esta reseña?'
              }
            </p>
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
                onClick={deleteConfirm === 'game' ? handleDeleteGame : handleDeleteReview}
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

export default DetalleJuego