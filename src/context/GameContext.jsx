import { createContext, useContext, useReducer, useEffect } from 'react'
import { gameService } from '../services/game-service'
import { reviewService } from '../services/reviewService'
import toast from 'react-hot-toast'

// Estado inicial
const initialState = {
  juegos: [],
  reseñas: [],
  estadisticas: null,
  loading: false,
  error: null,
  filtros: {
    buscar: '',
    genero: '',
    plataforma: '',
    completado: null,
    ordenar: 'fechaCreacion',
    orden: 'desc'
  }
}

// Tipos de acciones
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_JUEGOS: 'SET_JUEGOS',
  ADD_JUEGO: 'ADD_JUEGO',
  UPDATE_JUEGO: 'UPDATE_JUEGO',
  DELETE_JUEGO: 'DELETE_JUEGO',
  SET_RESEÑAS: 'SET_RESEÑAS',
  ADD_RESEÑA: 'ADD_RESEÑA',
  UPDATE_RESEÑA: 'UPDATE_RESEÑA',
  DELETE_RESEÑA: 'DELETE_RESEÑA',
  SET_ESTADISTICAS: 'SET_ESTADISTICAS',
  SET_FILTROS: 'SET_FILTROS',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload }

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }

    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null }

    case actionTypes.SET_JUEGOS:
      return { ...state, juegos: action.payload, loading: false, error: null }

    case actionTypes.ADD_JUEGO:
      return {
        ...state,
        juegos: [action.payload, ...state.juegos],
        loading: false,
        error: null
      }

    case actionTypes.UPDATE_JUEGO:
      return {
        ...state,
        juegos: state.juegos.map(juego =>
          juego._id === action.payload._id ? action.payload : juego
        ),
        loading: false,
        error: null
      }

    case actionTypes.DELETE_JUEGO:
      return {
        ...state,
        juegos: state.juegos.filter(juego => juego._id !== action.payload),
        reseñas: state.reseñas.filter(reseña => reseña.juegoId !== action.payload),
        loading: false,
        error: null
      }

    case actionTypes.SET_RESEÑAS:
      return { ...state, reseñas: action.payload, loading: false, error: null }

    case actionTypes.ADD_RESEÑA:
      return {
        ...state,
        reseñas: [action.payload, ...state.reseñas],
        loading: false,
        error: null
      }

    case actionTypes.UPDATE_RESEÑA:
      return {
        ...state,
        reseñas: state.reseñas.map(reseña =>
          reseña._id === action.payload._id ? action.payload : reseña
        ),
        loading: false,
        error: null
      }

    case actionTypes.DELETE_RESEÑA:
      return {
        ...state,
        reseñas: state.reseñas.filter(reseña => reseña._id !== action.payload),
        loading: false,
        error: null
      }

    case actionTypes.SET_ESTADISTICAS:
      return { ...state, estadisticas: action.payload, loading: false, error: null }

    case actionTypes.SET_FILTROS:
      return { ...state, filtros: { ...state.filtros, ...action.payload } }

    default:
      return state
  }
}

// Crear el contexto
const GameContext = createContext()

// Hook personalizado para usar el contexto
export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame debe ser usado dentro de GameProvider')
  }
  return context
}

// Provider del contexto
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Acciones para juegos
  const cargarJuegos = async (filtros = {}) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await gameService.getJuegos({ ...state.filtros, ...filtros })
      dispatch({ type: actionTypes.SET_JUEGOS, payload: response.data })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al cargar los juegos')
    }
  }

  const obtenerJuego = async (id) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await gameService.getJuego(id)
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al obtener el juego')
      return null
    }
  }

  const agregarJuego = async (juegoData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await gameService.createJuego(juegoData)
      dispatch({ type: actionTypes.ADD_JUEGO, payload: response.data })
      toast.success('Juego agregado exitosamente a tu biblioteca')
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al agregar el juego')
      throw error
    }
  }

  const actualizarJuego = async (id, juegoData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await gameService.updateJuego(id, juegoData)
      dispatch({ type: actionTypes.UPDATE_JUEGO, payload: response.data })
      toast.success('Juego actualizado exitosamente')
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al actualizar el juego')
      throw error
    }
  }

  const eliminarJuego = async (id) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      await gameService.deleteJuego(id)
      dispatch({ type: actionTypes.DELETE_JUEGO, payload: id })
      toast.success('Juego eliminado exitosamente de tu biblioteca')
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al eliminar el juego')
    }
  }

  // Acciones para reseñas
  const cargarReseñas = async (filtros = {}) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await reviewService.getReseñas(filtros)
      dispatch({ type: actionTypes.SET_RESEÑAS, payload: response.data })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al cargar las reseñas')
    }
  }

  const obtenerReseña = async (id) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await reviewService.getReseña(id)
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al obtener la reseña')
      return null
    }
  }

  const agregarReseña = async (reseñaData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await reviewService.createReseña(reseñaData)
      dispatch({ type: actionTypes.ADD_RESEÑA, payload: response.data })
      toast.success('Reseña agregada exitosamente')
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al agregar la reseña')
      throw error
    }
  }

  const actualizarReseña = async (id, reseñaData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const response = await reviewService.updateReseña(id, reseñaData)
      dispatch({ type: actionTypes.UPDATE_RESEÑA, payload: response.data })
      toast.success('Reseña actualizada exitosamente')
      return response.data
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al actualizar la reseña')
      throw error
    }
  }

  const eliminarReseña = async (id) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      await reviewService.deleteReseña(id)
      dispatch({ type: actionTypes.DELETE_RESEÑA, payload: id })
      toast.success('Reseña eliminada exitosamente')
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al eliminar la reseña')
    }
  }

  // Acciones para estadísticas
  const cargarEstadisticas = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const [juegosStats, reseñasStats] = await Promise.all([
        gameService.getEstadisticas(),
        reviewService.getEstadisticas()
      ])

      const estadisticas = {
        juegos: juegosStats.data,
        reseñas: reseñasStats.data
      }

      dispatch({ type: actionTypes.SET_ESTADISTICAS, payload: estadisticas })
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      toast.error('Error al cargar las estadísticas')
    }
  }

  // Acciones para filtros
  const actualizarFiltros = (nuevosFiltros) => {
    dispatch({ type: actionTypes.SET_FILTROS, payload: nuevosFiltros })
  }

  const limpiarFiltros = () => {
    dispatch({ type: actionTypes.SET_FILTROS, payload: initialState.filtros })
  }

  // Limpiar errores
  const limpiarError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR })
  }

  // Cargar datos iniciales
  useEffect(() => {
    cargarJuegos()
    cargarReseñas()
  }, [])

  const value = {
    ...state,

    // Acciones de juegos
    cargarJuegos,
    obtenerJuego,
    agregarJuego,
    actualizarJuego,
    eliminarJuego,

    // Acciones de reseñas
    cargarReseñas,
    obtenerReseña,
    agregarReseña,
    actualizarReseña,
    eliminarReseña,

    // Acciones de estadísticas
    cargarEstadisticas,

    // Acciones de filtros
    actualizarFiltros,
    limpiarFiltros,

    // Utilidades
    limpiarError
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export { GameContext }
