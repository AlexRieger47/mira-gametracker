import api from './api'

export const gameService = {
  // Obtener todos los juegos con filtros opcionales
  getJuegos: async (params = {}) => {
    const response = await api.get('/juegos', { params })
    return response.data
  },

  // Obtener un juego específico por ID
  getJuego: async (id) => {
    const response = await api.get(`/juegos/${id}`)
    return response.data
  },

  // Crear un nuevo juego
  createJuego: async (juegoData) => {
    const response = await api.post('/juegos', juegoData)
    return response.data
  },

  // Actualizar un juego existente
  updateJuego: async (id, juegoData) => {
    const response = await api.put(`/juegos/${id}`, juegoData)
    return response.data
  },

  // Eliminar un juego existente
  deleteJuego: async (id) => {
    const response = await api.delete(`/juegos/${id}`)
    return response.data
  },

  // Obtener estadísticas de juegos
  getEstadisticas: async () => {
    const response = await api.get('/juegos/estadisticas/resumen')
    return response.data
  },

  // Buscar juegos por título o desarrollador
  buscarJuegos: async (termino) => {
    const response = await api.get('/juegos', { params: { buscar: termino } })
    return response.data
  },

  // Obtener juegos por género
  getJuegosPorGenero: async (genero) => {
    const response = await api.get('/juegos', { params: { genero } })
    return response.data
  },

  // Obtener juegos por plataforma
  getJuegosPorPlataforma: async (plataforma) => {
    const response = await api.get('/juegos', { params: { plataforma } })
    return response.data
  },

  // Obtener juegos completados
  getJuegosCompletados: async () => {
    const response = await api.get('/juegos', { params: { completado: true } })
    return response.data
  },

  // Obtener juegos pendientes
  getJuegosPendientes: async () => {
    const response = await api.get('/juegos', { params: { completado: false } })
    return response.data
  },

  // Marcar juego como completado
  marcarJuegoCompletado: async (id) => {
    const response = await api.put(`/juegos/${id}`, { completado: true })
    return response.data
  },

  // Marcar juego como pendiente
  marcarJuegoPendiente: async (id) => {
    const response = await api.put(`/juegos/${id}`, { completado: false })
    return response.data
  },
}
