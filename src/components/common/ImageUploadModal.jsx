import { useState, useRef } from 'react'
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { uploadService } from '../../services/uploadService'
import './ImageUploadModal.css'

export default function ImageUploadModal({ isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef(null)

  if (!isOpen) return null

  const handleSelectFile = (e) => {
    const f = e.target.files?.[0]
    if (f) validateAndPreview(f)
  }

  const validateAndPreview = (f) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!validTypes.includes(f.type)) {
      toast.error('Formato no permitido. Usa PNG, JPG, WEBP o GIF.')
      return
    }
    if (f.size > 7 * 1024 * 1024) {
      toast.error('Imagen demasiado grande (máx 7MB)')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) validateAndPreview(f)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecciona una imagen primero')
      return
    }
    setIsUploading(true)
    try {
      const res = await uploadService.uploadImagen(file)
      if (res?.success && res?.data?.url) {
        toast.success('Imagen subida')
        onUploaded(res.data.url)
        onClose()
      } else {
        throw new Error(res?.message || 'No se pudo subir la imagen')
      }
    } catch (err) {
      toast.error(err.message || 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
      <div className="upload-modal">
        <div className="modal-header">
          <FaImage className="modal-icon" />
          <h3>Subir Imagen de Portada</h3>
        </div>

        <div
          className={`dropzone ${isDragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="preview-image" />
          ) : (
            <div className="dropzone-placeholder">
              <FaCloudUploadAlt className="dropzone-icon" />
              <p>Arrastra tu imagen aquí o haz clic para buscar</p>
              <span className="hint">PNG, JPG, WEBP o GIF · Máx 7MB</span>
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            ref={inputRef}
            onChange={handleSelectFile}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
            <FaTimes />
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? 'Subiendo...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}