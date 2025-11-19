const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar directorio de subidas
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeBase = path.parse(file.originalname).name.replace(/[^a-z0-9_\-]/gi, '_');
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${safeBase}_${Date.now()}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.mimetype)) {
    req.fileValidationError = 'Formato de imagen no permitido (solo PNG, JPG, WEBP, GIF)';
    return cb(null, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 7 * 1024 * 1024 } // 7MB
});

// Endpoint: subir portada con manejo de errores
router.post('/portadas', (req, res) => {
  upload.single('imagen')(req, res, (err) => {
    if (err) {
      // Errores de Multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'Imagen demasiado grande (máx 7MB)',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error al subir la imagen',
      });
    }

    // Error de validación de tipo de archivo
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError,
      });
    }

    // No se recibió archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió archivo',
      });
    }

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: publicUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  });
});

module.exports = router;