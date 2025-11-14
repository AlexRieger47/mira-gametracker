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
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://alexrieger47.github.io,http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Permite peticiones sin origen (curl/health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('/:path(*)', cors(corsOptions)); // Preflight
app.use(express.json());

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || '[REDACTED]'; // URL removida públicamente por motivos de Seguridad y Privacidad.
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 15000, // Aumentar el timeout a 15 segundos
  socketTimeoutMS: 45000, // Aumentar el timeout del socket a 45 segundos
  connectTimeoutMS: 15000, // Aumentar el timeout de conexión a 15 segundos
  maxPoolSize: 10 // Limitar el número máximo de conexiones en el pool
})
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
      igdb: '/api/igdb'
    }
  });
});

// Importar y usar rutas
const juegosRoutes = require('./routes/juegos.routes');
const reseñasRoutes = require('./routes/reseñas.routes');
const igdbRoutes = require('./routes/igdb.routes');

app.use('/api/juegos', juegosRoutes);
app.use('/api/resenas', reseñasRoutes);
app.use('/api/igdb', igdbRoutes);

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
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 API disponible en: http://localhost:${PORT}/api`);
});

module.exports = app;



