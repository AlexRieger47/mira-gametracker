const mongoose = require('mongoose');

const reseñaSchema = new mongoose.Schema({
    juegoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Juego',
      required: [true, 'El juego debe tener un ID']
    },
    puntuacion: {
      type: Number,
      required: [true, 'La reseña debe tener una puntuación'],
      min: [0, 'La puntuación mínima es 0 estrellas'],
      max: [5, 'La puntuación máxima es 5 estrellas'],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'La puntuación debe ser un número entero'
      }
    },
    textoReseña: {
      type: String,
      required: [true, 'La reseña debe tener un texto'],
      trim: true,
      minlength: [10, 'La reseña debe tener al menos 10 caracteres'],
      maxlength: [1000, 'La reseña no puede exceder los 1000 caracteres']
    },
    horasJugadas: {
      type: Number,
      required: [true, 'La reseña debe tener las horas jugadas'],
      min: [0, 'Las horas jugadas no pueden ser negativas'],
      default: 0,
      max: [100000, 'Las horas jugadas no pueden exceder los 100,000 horas']
    },
    dificultad: {
      type: String,
      required: [true, 'La reseña debe tener una dificultad'],
      enum: {
        values: ['Muy Fácil', 'Fácil', 'Normal', 'Difícil', 'Muy Difícil'],
        message: 'La dificultad debe ser uno de los siguientes: Muy Fácil, Fácil, Normal, Difícil, Muy Difícil'
      }
    },
    recomendaria: {
      type: Boolean,
      required: [true, 'Debe indicar si recomendaria el juego'],
      default: true
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now
    }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Obtener información del juego a partir de la reseña
reseñaSchema.virtual('juego', {
  ref: 'Juego',
  localField: 'juegoId',
  foreignField: '_id',
  justOne: true
});

// Actualizar la fecha de actualización cuando se actualice la reseña
reseñaSchema.pre('save', function(next) {
  this.fechaActualizacion = Date.now();
  next();
});

// Validación de solo una reseña por juego
reseñaSchema.index({ juegoId: 1 }, { unique: true });

// Índices para mejorar rendimiento
reseñaSchema.index({ puntuacion: 1 });
reseñaSchema.index({ dificultad: 1 });
reseñaSchema.index({ recomendaria: 1 });
reseñaSchema.index({ fechaCreacion: -1 });
reseñaSchema.index({ horasJugadas: -1 });

// Método para obtener estadísticas
reseñaSchema.statics.getEstadisticas = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalReseñas: { $sum: 1 },
        puntuacionMedia: { $avg: '$puntuacion' },
        horasTotales: { $sum: '$horasJugadas' },
        recomendacionesPositivas: { $sum: {$cond: ['$recomendaria', 1, 0]} 
      }
      }
    }
  ]);
};

const Reseña = mongoose.model('Reseña', reseñaSchema);

module.exports = Reseña;
