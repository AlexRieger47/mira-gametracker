import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { GameContext } from '../../context/GameContext'
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaDesktop,
  FaCalendarAlt,
  FaGamepad,
  FaStar,
  FaHeart,
  FaHeartBroken
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import './TarjetaJuego.css'

const TarjetaJuego = ({ game, viewMode = 'grid' }) => {
  const { eliminarJuego, actualizarJuego } = useContext(GameContext)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Manejar eliminación
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await eliminarJuego(game._id)
      setShowDeleteConfirm(false)
    } catch (error) {
      // El contexto ya muestra el error correspondiente
    } finally {
      setIsDeleting(false)
    }
  }

  // Alternar estado completado
  const toggleCompleted = async () => {
    try {
      await actualizarJuego(game._id, {
        completado: !game.completado
      })
      toast.success(
        game.completado
          ? 'Juego marcado como pendiente'
          : 'Juego marcado como completado'
      )
    } catch (error) {
      toast.error('Error al actualizar el estado completado')
    }
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

  // Imagen por defecto si no hay imagen
  const defaultImage = (game) => `https://via.placeholder.com/300x400/6366f1/ffffff?text=${encodeURIComponent(game.titulo)}`

  if (viewMode === 'list') {
    return (
      <div className="tarjeta-juego list-view">
        <div className="game-image-container">
          <img
            src={game.imagenPortada || defaultImage(game)}
            alt={game.titulo}
            className="game-image"
            onError={(e) => {
              e.target.src = defaultImage(game)
            }}
          />
          <div className="image-overlay">
            <Link to={`/juego/${game._id}`} className="overlay-btn view-btn">
              <FaEye />
            </Link>
          </div>
        </div>

        <div className="game-content">
          <div className="game-header">
            <h3 className="game-title">{game.titulo}</h3>
            <div className="game-status">
              <button
                className={`status-btn ${game.completado ? 'completed' : 'pending'}`}
                onClick={toggleCompleted}
                title={game.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
              >
                {game.completado ? <FaCheckCircle /> : <FaClock />}
              </button>
            </div>
          </div>

          <div className="game-meta">
            <span className="game-developer">{game.desarrollador}</span>
            <span className="game-year">{game.añoLanzamiento}</span>
            <span
              className="game-genre"
              style={{ backgroundColor: getGenreColor(game.genero) }}
            >
              {game.genero}
            </span>
            <span className="game-platform">{game.plataforma}</span>
          </div>

          <p className="game-description">
            {game.descripcion?.length > 150
              ? `${game.descripcion.substring(0, 150)}...`
              : game.descripcion || 'Sin descripción disponible'
            }
          </p>

          <div className="game-footer">
            <div className="game-date">
              <FaCalendarAlt />
              <span>Agregado: {formatDate(game.fechaCreacion)}</span>
            </div>

            <div className="game-actions">
              <Link
                to={`/editar-juego/${game._id}`}
                className="action-btn edit-btn"
                title="Editar juego"
              >
                <FaEdit />
              </Link>
              <button
                className="action-btn delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                title="Eliminar juego"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="delete-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <FaTrash className="modal-icon" />
                <h3>Confirmar Eliminación</h3>
              </div>
              <p>¿Estás seguro de que deseas eliminar "{game.titulo}"?</p>
              <p className="modal-warning">Esta acción no se puede deshacer.</p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vista de tarjeta (grid)
  return (
    <div className="tarjeta-juego grid-view">
      <div className="game-image-container">
        <img
          src={game.imagenPortada || defaultImage(game)}
          alt={game.titulo}
          className="game-image"
          onError={(e) => {
            e.target.src = defaultImage(game)
          }}
        />

        <div className="image-overlay">
          <Link to={`/juego/${game._id}`} className="overlay-btn view-btn">
            <FaEye />
            <span>Ver Detalles</span>
          </Link>
        </div>

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

      <div className="game-content">
        <div className="game-header">
          <h3 className="game-title" title={game.titulo}>
            {game.titulo}
          </h3>
          <button
            className={`status-btn ${game.completado ? 'completed' : 'pending'}`}
            onClick={toggleCompleted}
            title={game.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
          >
            {game.completado ? <FaCheckCircle /> : <FaClock />}
          </button>
        </div>

        <div className="game-meta">
          <div className="meta-item">
            <FaGamepad className="meta-icon" />
            <span>{game.desarrollador}</span>
          </div>
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>{game.añoLanzamiento}</span>
          </div>
        </div>

        <div className="game-platform">
          <FaDesktop className="meta-icon" />
          <span>{game.plataforma}</span>
        </div>

        <p className="game-description" title={game.descripcion}>
          {game.descripcion?.length > 150
            ? `${game.descripcion.substring(0, 150)}...`
            : game.descripcion || 'Sin descripción disponible'
          }
        </p>

        <div className="game-footer">
          <div className="game-date">
            <span>Agregado: {formatDate(game.fechaCreacion)}</span>
          </div>

          <div className="game-actions">
            <Link
              to={`/editar-juego/${game._id}`}
              className="action-btn edit-btn"
              title="Editar juego"
            >
              <FaEdit />
            </Link>
            <button
              className="action-btn delete-btn"
              onClick={() => setShowDeleteConfirm(true)}
              title="Eliminar juego"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaTrash className="modal-icon" />
              <h3>Confirmar Eliminación</h3>
            </div>
            <p>¿Estás seguro de que quieres eliminar "{game.titulo}"?</p>
            <p className="modal-warning">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TarjetaJuego