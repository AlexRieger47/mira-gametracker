import api from './api'

export const reviewService = {
  // Obtener todas las reseñas con filtros opcionales
  getReseñas: async (params = {}) => {
    const response = await api.get('/resenas', { params })
    return response.data
  },

  // Obtener una reseña específica por ID
  getReseña: async (id) => {
    const response = await api.get(`/resenas/${id}`)
    return response.data
  },

  // Obtener reseñas de un juego específico
  getReseñasPorJuego: async (juegoId) => {
    const response = await api.get(`/resenas/juego/${juegoId}`)
    return response.data
  },

  // Crear una nueva reseña
  createReseña: async (reseñaData) => {
    const response = await api.post('/resenas', reseñaData)
    return response.data
  },

  // Actualizar una reseña existente
  updateReseña: async (id, reseñaData) => {
    const response = await api.put(`/resenas/${id}`, reseñaData)
    return response.data
  },

  // Eliminar una reseña existente
  deleteReseña: async (id) => {
    const response = await api.delete(`/resenas/${id}`)
    return response.data
  },

  // Obtener estadísticas de reseñas
  getEstadisticas: async () => {
    const response = await api.get('/resenas/estadisticas/resumen')
    return response.data
  },

  // Obtener reseñas por puntuación
  getReseñasPorPuntuacion: async (puntuacionMin, puntuacionMax) => {
    const response = await api.get('/resenas', { params: { puntuacionMin, puntuacionMax } })
    return response.data
  },

  // Obtener reseñas recomendadas
  getReseñasRecomendadas: async () => {
    const response = await api.get('/resenas', { params: { recomendaria: true } })
    return response.data
  },

  // Obtener reseñas por dificultad
  getReseñasPorDificultad: async (dificultad) => {
    const response = await api.get('/resenas', { params: { dificultad } })
    return response.data
  },

  // Verificar si existe reseña para un juego
  verificarReseñaExistente: async (juegoId) => {
    try {
      const response = await api.get(`/resenas/juego/${juegoId}`)
      return response.data.length > 0
    } catch (error) {
        return false
      }
    }
  }

