const mongoose = require('mongoose');

const JuegoSchema = new mongoose.Schema({
    titulo: {
      type: String,
      required: [true, 'El juego debe tener un título'],
      trim: true,
      maxlength: [100, 'El título del juego no puede exceder los 100 caracteres']
    },
    genero: {
      type: String,
      required: [true, 'El juego debe tener un género'],
      enum: ['Acción', 'Aventura', 'RPG', 'Estrategia', 'Simulación', 
      'Deportes', 'Carreras', 'Puzzle', 'Plataformas', 'Shooter',
      'Terror', 'Supervivencia', 'Indie', 'Multijugador', 'Otro']
    },
    plataforma: {
      type: String,
      required: [true, 'El juego debe tener una plataforma'],
      enum: ['PC', 'Consola de Sobremesa', 'Consola Portátil', 'Mobile', 'Otro']
    },
    añoLanzamiento: {
      type: Number,
      required: [true, 'El juego debe tener un año de lanzamiento'],
      min: [1900, 'El año de lanzamiento no puede ser anterior a 1900'],
      max: [new Date().getFullYear(), `El año de lanzamiento no puede ser posterior al ${new Date().getFullYear()}`]
    },
    desarrollador: {
      type: String,
      required: [true, 'El juego debe tener un desarrollador'],
      trim: true,
      maxlength: [50, 'El nombre del desarrollador no puede exceder los 50 caracteres']
    },
    imagenPortada: {
      type: String,
      default: 'https://via.placeholder.com/150',
      validate: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) || v === 'https://via.placeholder.com/150';
        // Validar que la URL sea segura y su formato sea válido
      },
      message: 'La URL de la imagen de portada no es válida. Asegúrate de que sea segura y tenga un formato válido (jpg, jpeg, png, gif, webp).'
    },
    descripcion: {
      type: String,
      required: [true, 'El juego debe tener una descripción'],
      trim: true,
      maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
    },
    completado: {
      type: Boolean,
      default: false
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Obtener las reseñas del juego
JuegoSchema.virtual('reseñas', {
  ref: 'Reseña',
  localField: '_id',
  foreignField: 'juegoId',
});

// Índices
JuegoSchema.index({titulo: 1});
JuegoSchema.index({genero: 1});
JuegoSchema.index({plataforma: 1});
JuegoSchema.index({completado: 1});
JuegoSchema.index({fechaCreacion: -1});

const Juego = mongoose.model('Juego', JuegoSchema);

module.exports = Juego;