import api from './api'

export const uploadService = {
  uploadImagen: async (file) => {
    const formData = new FormData()
    formData.append('imagen', file)

    // Axios agrega el boundary automáticamente
    const response = await api.post('/uploads/portadas', formData)
    return response.data
  }
}