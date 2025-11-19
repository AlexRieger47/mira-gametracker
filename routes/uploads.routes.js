const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar directorio de subidas
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeBase = path.basename(file.originalname).name.replace(/[^a-z0-9_\-]/gi, '_');
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${safeBase}:${Date.now()}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Formato de imagen no permitido. Solo se permiten imágenes JPEG, PNG, WEBP y GIF.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 7 // 7MB
  }
});

// Subir portada
router.post('/portadas', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: '❌ Error de subida',
      message: 'No se ha subido ninguna imagen. Por favor, selecciona una imagen válida.'
    })
  }

  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  return res.status(201).json({
    success: true,
    message: '✅ Imagen subida exitosamente',
    data: {
      url: publicUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

module.exports = router;
