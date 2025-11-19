import axios from 'axios'

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para Requests
api.interceptors.request.use(
  (config) => {
    // Me recomendaron agregar tokens/headers de autenticación aquí
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error(`❌ Error en request:`, error)
    return Promise.reject(error)
  }
)

// Interceptor para Responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || error.status}`)

    // Manejo de errores globales
    if (error.response) {
      const { status, data } = error.response

      switch(status) {
        case 400:
          console.error('❌ Error de validación:', data.message || data.errors)
          break
        case 401:
          console.error('❌ No autorizado:', data)
          // Acá podría redirigir al login de ser necesario
          break
        case 403:
          console.error('❌ Acceso Prohibido:', data)
          break
        case 404:
          console.error('❌ Recurso no encontrado:', data)
          break
        case 500:
          console.error('❌ Error interno del servidor:', data)
          break
        default:
          console.error('❌ Error desconocido:', data.message)
      }

      // Retornar el error con información estructurada
      return Promise.reject({
        message: data.message || 'Error en la solicitud',
        errors: data.errors || [],
        status,
        data
      })
    }else if (error.request) {
      console.error('❌ Sin respuesta del servidor')
      return Promise.reject({
        message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
        status: 0
      })
    }else {
      console.error('❌ Error de configuración:', error.message)
      return Promise.reject({
        message: 'Error de configuración en la solicitud',
        status: 0
      })
    }
  }
)

export default api