import api from './api'

export const uploadService = {
  uploadImagen: async (file) => {
    const formData = new FormData()
    formData.append('imagen', file)

    const response = await api.post('/uploads/portadas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}