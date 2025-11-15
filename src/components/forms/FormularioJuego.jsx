import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { GameContext } from '../../context/GameContext'
import {
  FaGamepad,
  FaSave,
  FaTimes,
  FaImage,
  FaCalendarAlt,
  FaUsers,
  FaDesktop,
  FaTag,
  FaFileAlt,
  FaCheckCircle
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { searchIGDB, getIGDBGame } from '../../services/igdbService'
import './FormularioJuego.css'

const FormularioJuego = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const {
    juegos,
    agregarJuego,
    actualizarJuego,
    obtenerJuego,
    loading
  } = useContext(GameContext)

  const [imagePreview, setImagePreview] = useState('')
  const [isLoadingGame, setIsLoadingGame] = useState(isEditing)
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [extraPlatform, setExtraPlatform] = useState('')
  const [extraGenre, setExtraGenre] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      titulo: '',
      genero: '',
      plataforma: '',
      añoLanzamiento: new Date().getFullYear(),
      desarrollador: '',
      imagenPortada: '',
      descripcion: '',
      completado: false
    }
  })

  const watchImageUrl = watch('imagenPortada')
  const watchTitle = watch('titulo')

  // Cargar datos del juego si estamos editando
  useEffect(() => {
    const loadGameData = async () => {
      if (isEditing) {
        setIsLoadingGame(true)
        try {
          let juegoData = juegos.find(j => (j._id === id || j.id === id))
          if (!juegoData) {
            juegoData = await obtenerJuego(id)
          }

          if (juegoData) {
            reset({
              titulo: juegoData.titulo || '',
              genero: juegoData.genero || '',
              plataforma: juegoData.plataforma || '',
              añoLanzamiento: juegoData.añoLanzamiento || new Date().getFullYear(),
              desarrollador: juegoData.desarrollador || '',
              imagenPortada: juegoData.imagenPortada || '',
              descripcion: juegoData.descripcion || '',
              completado: juegoData.completado || false
            })

            if (juegoData.imagenPortada) {
              setImagePreview(juegoData.imagenPortada)
            }
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
    }

    loadGameData()
  }, [id, isEditing, juegos, obtenerJuego, reset, navigate])

  // Actualizar preview de imagen cuando cambia la URL
  useEffect(() => {
    if (watchImageUrl && watchImageUrl.trim()) {
      setImagePreview(watchImageUrl)
    } else {
      setImagePreview('')
    }
  }, [watchImageUrl])

  // Autocompletado de título con IGDB
  useEffect(() => {
    const q = (watchTitle || '').trim()
    if (!q || q.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    setIsSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await searchIGDB(q, 8)
        setSuggestions(res.suggestions || [])
        setShowSuggestions(Boolean(res.suggestions && res.suggestions.length))
      } catch (e) {
        // Silenciar errores de red, mostrar al usuario si quiere abrir manualmente
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsSearching(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [watchTitle])

  const handlePickSuggestion = async (sugg) => {
    try {
      setIsSearching(true)
      const details = await getIGDBGame(sugg.id)

      // Ajustar opciones extra si no existen
      const generoTarget = details.genero || ''
      const plataformaTarget = details.plataforma || ''

      if (generoTarget && !generos.includes(generoTarget)) {
        setExtraGenre(generoTarget)
      }
      if (plataformaTarget && !plataformas.includes(plataformaTarget)) {
        setExtraPlatform(plataformaTarget)
      }

      setValue('titulo', details.titulo || sugg.title || '', { shouldValidate: true })
      setValue('genero', generoTarget || '', { shouldValidate: true })
      setValue('plataforma', plataformaTarget || '', { shouldValidate: true })
      setValue('añoLanzamiento', details.añoLanzamiento || new Date().getFullYear(), { shouldValidate: true })
      setValue('desarrollador', details.desarrollador || '', { shouldValidate: true })
      setValue('imagenPortada', details.imagenPortada || '', { shouldValidate: true })
      setValue('descripcion', details.descripcion || '', { shouldValidate: true })

      if (details.imagenPortada) setImagePreview(details.imagenPortada)

      toast.success('Datos importados desde IGDB')
    } catch (error) {
      toast.error('No se pudieron importar los datos desde IGDB')
    } finally {
      setShowSuggestions(false)
      setIsSearching(false)
    }
  }

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      // Convertir año a número
      const juegoData = {
        ...data,
        añoLanzamiento: parseInt(data.añoLanzamiento)
      }

      if (isEditing) {
        await actualizarJuego(id, juegoData)
        toast.success('Juego actualizado correctamente')
      } else {
        await agregarJuego(juegoData)
        toast.success('Juego agregado correctamente')
      }

      navigate('/biblioteca')
    } catch (error) {
      toast.error(
        isEditing
          ? 'Error al actualizar el juego'
          : 'Error al agregar el juego'
      )
    }
  }

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/biblioteca')
  }

  // Opciones para los selects
  const generos = [
    'Acción', 'Aventura', 'RPG', 'Estrategia', 'Simulación', 'Deportes', 'Carreras', 'Puzzle', 'Plataformas', 'Shooter', 'Terror', 'Supervivencia', 'Indie', 'Multijugador', 'Otro'
  ]
  const plataformas = [
    'PC', 'Consola de Sobremesa', 'Consola Portátil', 'Mobile', 'Otro'
  ]

  if (isLoadingGame) {
    return (
      <div className="formulario-juego">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
        <p>Cargando información del juego...</p>
      </div>
    )
  }

  return (
    <div className="formulario-juego">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="header-content">
            {/*<FaGamepad className="header-icon" />*/}
            <div>
              <h1>{isEditing ? 'Editar Juego' : 'Agregar Nuevo Juego'}</h1>
              <p>
                {isEditing
                  ? 'Modifica la información del juego'
                  : 'Completa la información del nuevo juego'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="game-form">
          <div className="form-grid">
            {/* Título */}
            <div className="form-group full-width">
              <label htmlFor="titulo">
                <FaGamepad className="label-icon" />
                Título del Juego *
              </label>
              <input
                type="text"
                id="titulo"
                {...register('titulo', {
                  required: 'El título es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El título debe tener al menos 2 caracteres'
                  }
                })}
                className={errors.titulo ? 'error' : ''}
                placeholder="Ej: Minecraft: Java Edition"
              />
              {/* Dropdown de sugerencias de IGDB */}
              {showSuggestions && (
                <div className="igdb-suggestions">
                  {suggestions.map((s) => (
                    <button
                      key={`${s.id}-${s.title}`}
                      type="button"
                      className="suggestion-item"
                      onClick={() => handlePickSuggestion(s)}
                      title={`Importar datos de \"${s.title}\" (IGDB)`}
                    >
                      <span className="suggestion-title">{s.title}</span>
                      {s.releaseYear && <span className="suggestion-year">{s.releaseYear}</span>}
                      {Array.isArray(s.platforms) && s.platforms.length > 0 && (
                        <span className="suggestion-platforms">
                          {s.platforms.slice(0, 2).map(p => p).join(' · ')}
                          {s.platforms.length > 2 ? ' · …' : ''}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {errors.titulo && (
                <span className="error-message">{errors.titulo.message}</span>
              )}
            </div>

            {/* Género */}
            <div className="form-group">
              <label htmlFor="genero">
                <FaTag className="label-icon" />
                Género *
              </label>
              <select
                id="genero"
                {...register('genero', {
                  required: 'El género es obligatorio'
                })}
                className={errors.genero ? 'error' : ''}
              >
                <option className="genre-option" value="">Selecciona un género</option>
                {[...generos, ...(extraGenre ? [extraGenre] : [])].map(genero => (
                  <option key={genero} value={genero}>
                    {genero}
                  </option>
                ))}
              </select>
              {errors.genero && (
                <span className="error-message">{errors.genero.message}</span>
              )}
            </div>

            {/* Plataforma */}
            <div className="form-group">
              <label htmlFor="plataforma">
                <FaDesktop className="label-icon" />
                Plataforma *
              </label>
              <select
                id="plataforma"
                {...register('plataforma', {
                  required: 'La plataforma es obligatoria'
                })}
                className={errors.plataforma ? 'error' : ''}
              >
                <option value="">Selecciona una plataforma</option>
                {[...plataformas, ...(extraPlatform ? [extraPlatform] : [])].map(plataforma => (
                  <option key={plataforma} value={plataforma}>
                    {plataforma}
                  </option>
                ))}
              </select>
              {errors.plataforma && (
                <span className="error-message">{errors.plataforma.message}</span>
              )}
            </div>

            {/* Año de lanzamiento */}
            <div className="form-group">
              <label htmlFor="añoLanzamiento">
                <FaCalendarAlt className="label-icon" />
                Año de Lanzamiento *
              </label>
              <input
                type="number"
                id="añoLanzamiento"
                {...register('añoLanzamiento', {
                  required: 'El año es obligatorio',
                  min: {
                    value: 1970,
                    message: 'El año debe ser mayor a 1970'
                  },
                  max: {
                    value: new Date().getFullYear() + 5,
                    message: `El año no puede ser mayor a ${new Date().getFullYear() + 5}`
                  }
                })}
                className={errors.añoLanzamiento ? 'error' : ''}
                min="1970"
                max={new Date().getFullYear() + 5}
              />
              {errors.añoLanzamiento && (
                <span className="error-message">{errors.añoLanzamiento.message}</span>
              )}
            </div>

            {/* Desarrollador */}
            <div className="form-group">
              <label htmlFor="desarrollador">
                <FaUsers className="label-icon" />
                Desarrollador *
              </label>
              <input
                type="text"
                id="desarrollador"
                {...register('desarrollador', {
                  required: 'El desarrollador es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El desarrollador debe tener al menos 2 caracteres'
                  }
                })}
                className={errors.desarrollador ? 'error' : ''}
                placeholder="Ej: Nintendo EPD"
              />
              {errors.desarrollador && (
                <span className="error-message">{errors.desarrollador.message}</span>
              )}
            </div>

            {/* URL de imagen */}
            <div className="form-group full-width">
              <label htmlFor="imagenPortada">
                <FaImage className="label-icon" />
                URL de la Imagen de Portada
              </label>
              <input
                type="url"
                id="imagenPortada"
                {...register('imagenPortada', {
                  pattern: {
                    value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                    message: 'Debe ser una URL válida de imagen (jpg, jpeg, png, gif, webp)'
                  }
                })}
                className={errors.imagenPortada ? 'error' : ''}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {errors.imagenPortada && (
                <span className="error-message">{errors.imagenPortada.message}</span>
              )}

              {/* Preview de imagen */}
              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    onError={() => setImagePreview('')}
                  />
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="form-group full-width">
              <label htmlFor="descripcion">
                <FaFileAlt className="label-icon" />
                Descripción
              </label>
              <textarea
                id="descripcion"
                {...register('descripcion', {
                  maxLength: {
                    value: 500,
                    message: 'La descripción no puede exceder 500 caracteres'
                  }
                })}
                className={errors.descripcion ? 'error' : ''}
                placeholder="Describe el juego, su historia, mecánicas principales..."
                rows="4"
              />
              {errors.descripcion && (
                <span className="error-message">{errors.descripcion.message}</span>
              )}
              <div className="character-count">
                {watch('descripcion')?.length || 0}/500 caracteres
              </div>
            </div>

            {/* Estado de completado */}
            <div className="form-group full-width">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="completado"
                  {...register('completado')}
                />
                <label htmlFor="completado" className="checkbox-label">
                  <FaCheckCircle className="checkbox-icon" />
                  <span>Marcar como completado</span>
                </label>
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
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  {isEditing ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {isEditing ? 'Actualizar Juego' : 'Guardar Juego'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioJuego