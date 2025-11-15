import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { GameContext } from '../../context/GameContext'
import {
  FaStar,
  FaSave,
  FaTimes,
  FaGamepad,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaAlignLeft,
  FaExclamationTriangle
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import './FormularioReseña.css'

const FormularioReseña = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const isEditing = Boolean(id)

  const {
    juegos,
    agregarReseña,
    actualizarReseña,
    obtenerReseña,
    cargarJuegos,
    loading
  } = useContext(GameContext)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      juegoId: '',
      puntuacion: 5,
      textoReseña: '',
      horasJugadas: 0,
      dificultad: 'Normal',
      recomendaria: true,
    }
  })

  const nivelesDificultad = ['Muy Fácil', 'Fácil', 'Normal', 'Difícil', 'Muy Difícil']

  // Cargar juegos al montar el componente
  useEffect(() => {
    if (juegos.length === 0) {
      cargarJuegos()
    }
  }, [juegos.length, cargarJuegos])

  // Cargar datos de la reseña si estamos editando (una sola vez por id)
  useEffect(() => {
    if (!isEditing) return

    let isMounted = true
    const loadReview = async () => {
      try {
        const review = await obtenerReseña(id)
        if (review && isMounted) {
          reset({
            juegoId: review.juegoId._id || review.juegoId,
            puntuacion: review.puntuacion,
            textoReseña: review.textoReseña || '',
            horasJugadas: review.horasJugadas || 0,
            dificultad: review.dificultad || 'Normal',
            recomendaria: review.recomendaria
          })
        }
      } catch (error) {
        toast.error('Error al cargar los datos de la reseña')
        navigate('/resenas')
      }
    }

    loadReview()
    return () => { isMounted = false }
  }, [isEditing, id])

  // Preseleccionar juego si viene de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const juegoId = searchParams.get('juego')

    if (juegoId && !isEditing) {
      setValue('juegoId', juegoId)
      const juego = juegos.find(j => j._id === juegoId)
      setSelectedGame(juego)
    }
  }, [location.search, juegos, setValue, isEditing])

  // Observar cambios en el juego seleccionado
  const juegoId = watch('juegoId')
  useEffect(() => {
    if (juegoId) {
      const juego = juegos.find(j => j._id === juegoId)
      setSelectedGame(juego)
    } else {
      setSelectedGame(null)
    }
  }, [juegoId, juegos])

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      if (data.horasJugadas < 0) {
        toast.error('Las horas jugadas no pueden ser negativas')
        setIsSubmitting(false)
        return
      }

      if (data.horasJugadas > 10000) {
        toast.error('Las horas jugadas parecen excesivas')
        setIsSubmitting(false)
        return
      }

      if (isEditing) {
        await actualizarReseña(id, data)
        toast.success('Reseña actualizada correctamente')
      } else {
        await agregarReseña(data)
        toast.success('Reseña agregada correctamente')
      }

      navigate('/resenas')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message

      if (errorMessage.includes('ya existe una reseña')) {
        toast.error('Ya existe una reseña para este juego')
      } else {
        toast.error(
          isEditing
            ? 'Error al actualizar la reseña'
            : 'Error al agregar la reseña'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/resenas')
  }

  // Renderizar estrellas para puntuación
  const renderStars = (rating, onStarClick) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        className={`star-btn ${index < rating ? 'active' : ''}`}
        onClick={() => onStarClick(index + 1)}
      >
        <FaStar />
      </button>
    ))
  }

  const puntuacion = watch('puntuacion')
  const recomendaria = watch('recomendaria')

  return (
    <div className="formulario-reseña">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="header-content">
            <FaStar className="header-icon" />
            <div>
              <h1>{isEditing ? 'Editar Reseña' : 'Agregar Nueva Reseña'}</h1>
              <p>
                {isEditing
                  ? 'Modifica tu reseña del juego'
                  : 'Comparte tu experiencia y opinión sobre el juego'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="review-form">
          <div className="form-grid">
            {/* Selección de juego */}
            <div className="form-group full-width">
              <label htmlFor="juegoId">
                <FaGamepad className="label-icon" />
                Juego *
              </label>
              <select
                id="juegoId"
                {...register('juegoId', {
                  required: 'Debes seleccionar un juego'
                })}
                className={errors.juegoId ? 'error' : ''}
                disabled={isEditing}
              >
                <option value="">Selecciona un juego</option>
                {juegos.map(juego => (
                  <option key={juego._id} value={juego._id}>
                    {juego.titulo} ({juego.añoLanzamiento})
                  </option>
                ))}
              </select>
              {errors.juegoId && (
                <span className="error-message">{errors.juegoId.message}</span>
              )}

              {/* Información del juego seleccionado */}
              {selectedGame && (
                <div className="selected-game-info">
                  <div className="game-card">
                    {selectedGame.imagenPortada && (
                      <img
                        src={selectedGame.imagenPortada}
                        alt={selectedGame.titulo}
                        className="game-image"
                      />
                    )}
                    <div className="game-details">
                      <h3>{selectedGame.titulo}</h3>
                      <p>
                        <strong>Desarrollador:</strong> {selectedGame.desarrollador}
                      </p>
                      <p>
                        <strong>Género:</strong> {selectedGame.genero} |
                        <strong> Plataforma:</strong> {selectedGame.plataforma}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Puntuación */}
            <div className="form-group full-width">
              <label>
                <FaStar className="label-icon" />
                Puntuación * ({puntuacion}/5)
              </label>
              <div className="rating-container">
                <div className="stars-container">
                  {renderStars(puntuacion, (rating) => setValue('puntuacion', rating))}
                </div>
                <div className="rating-labels">
                  <span className="rating-label">
                    {puntuacion === 1 && 'Muy malo'}
                    {puntuacion === 2 && 'Malo'}
                    {puntuacion === 3 && 'Regular'}
                    {puntuacion === 4 && 'Bueno'}
                    {puntuacion === 5 && 'Excelente'}
                  </span>
                </div>
              </div>
              <input
                type="hidden"
                {...register('puntuacion', {
                  required: 'La puntuación es obligatoria',
                  min: { value: 1, message: 'La puntuación mínima es 1' },
                  max: { value: 5, message: 'La puntuación máxima es 5' }
                })}
              />
              {errors.puntuacion && (
                <span className="error-message">{errors.puntuacion.message}</span>
              )}
            </div>

            {/* Horas jugadas */}
            <div className="form-group">
              <label htmlFor="horasJugadas">
                <FaClock className="label-icon" />
                Horas Jugadas
              </label>
              <input
                id="horasJugadas"
                type="number"
                min="0"
                max="10000"
                step="0.5"
                {...register('horasJugadas', {
                  valueAsNumber: true,
                  required: { value: true, message: 'Las horas jugadas son obligatorias' },
                  min: { value: 0, message: 'Las horas no pueden ser negativas' },
                  max: { value: 10000, message: 'Máximo 10,000 horas' }
                })}
                className={errors.horasJugadas ? 'error' : ''}
                placeholder="0"
              />
              {errors.horasJugadas && (
                <span className="error-message">{errors.horasJugadas.message}</span>
              )}
            </div>

            {/* Dificultad */}
            <div className="form-group">
              <label htmlFor="dificultad">
                <FaExclamationTriangle className="label-icon" />
                Dificultad
              </label>
              <select
                id="dificultad"
                {...register('dificultad')}
              >
                {nivelesDificultad.map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
            </div>

            {/* Recomendación */}
            <div className="form-group full-width">
              <label>¿Recomendarías este juego?</label>
              <div className="recommendation-container">
                <button
                  type="button"
                  className={`recommendation-btn ${recomendaria ? 'active positive' : ''}`}
                  onClick={() => setValue('recomendaria', true)}
                >
                  <FaThumbsUp />
                  Sí, lo recomiendo
                </button>
                <button
                  type="button"
                  className={`recommendation-btn ${!recomendaria ? 'active negative' : ''}`}
                  onClick={() => setValue('recomendaria', false)}
                >
                  <FaThumbsDown />
                  No lo recomiendo
                </button>
              </div>
              <input
                type="hidden"
                {...register('recomendaria')}
              />
            </div>

            {/* Texto de la reseña */}
            <div className="form-group full-width">
              <label htmlFor="textoReseña">
                <FaAlignLeft className="label-icon" />
                Tu Reseña
              </label>
              <textarea
                id="textoReseña"
                rows="6"
                {...register('textoReseña', {
                  required: { value: true, message: 'La reseña es obligatoria' },
                  minLength: { value: 10, message: 'La reseña debe tener al menos 10 caracteres' },
                  maxLength: {
                    value: 1000,
                    message: 'La reseña no puede exceder 1000 caracteres'
                  }
                })}
                className={errors.textoReseña ? 'error' : ''}
                placeholder="Comparte tu experiencia, qué te gustó, qué no te gustó, consejos para otros jugadores..."
              />
              {errors.textoReseña && (
                <span className="error-message">{errors.textoReseña.message}</span>
              )}
              <div className="character-count">
                {watch('textoReseña')?.length || 0}/1000 caracteres
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              <FaTimes />
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || loading}
            >
              <FaSave />
              {isSubmitting
                ? (isEditing ? 'Actualizando...' : 'Guardando...')
                : (isEditing ? 'Actualizar Reseña' : 'Guardar Reseña')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioReseña
