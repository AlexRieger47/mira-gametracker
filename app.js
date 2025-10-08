require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json());

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alexrieger147_db_user:dwRdzz1dbWkSrr8M@cluster0.jgqcs9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Conectado a MongoDB - Base de Datos de GameTracker'))
.catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Rutas
app.get('/api', (req, res) => {
  res.json({
    message: '🎮 GameTracker API - Tu biblioteca personal de Videojuegos',
    version: '1.0.0',
    endpoints: {
      juegos: '/api/juegos',
      reseñas: '/api/resenas',
    }
  });
});

// Importar y usar rutas
const juegosRoutes = require('./routes/juegos.routes');
const reseñasRoutes = require('./routes/reseñas.routes');

app.use('/api/juegos', juegosRoutes);
app.use('/api/resenas', reseñasRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:',err.message);
  res.status(500).json({
    error: '❌ Error interno del servidor',
    message: err.message
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: '❌ Ruta no encontrada',
    message: 'La ruta solicitada no existe en la API de GameTracker',
  });
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en http://localhost:${PORT}");
  console.log("📚 API disponible en: http://localhost:${PORT}/api");
});

module.exports = app;



