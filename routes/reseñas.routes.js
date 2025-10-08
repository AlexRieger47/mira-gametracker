const express = require('express');
const router = express.Router();
const Juego = require('../models/juego')
const Reseña = require('../models/reseña')

// OBTENER TODAS LAS RESEÑAS (GET /api/reseñas)
router.get('/', async (req, res) => {
  try {
    const {
      juegoId,
      puntuacionMin,
      puntuacionMax,
      dificultad,
      recomendaria,
      ordenar = 'fechaCreacion',
      orden = 'desc',
      limite = 20,
      pagina = 1
    } = req.query;

    // Construir filtros
    const filtros = {};

    if (juegoId) filtros.juegoId = juegoId;
    if (dificultad) filtros.dificultad = dificultad;
    if (recomendaria !== undefined) filtros.recomendaria = recomendaria === 'true';

    // Filtros por puntuación
    if (puntuacionMin || puntuacionMax) {
      filtros.puntuacion = {};
      if (puntuacionMin) filtros.puntuacion.$gte = Number(puntuacionMin);
      if (puntuacionMax) filtros.puntuacion.$lte = Number(puntuacionMax);
    }

    // Configurar Ordenamiento
    const ordenamiento = {};
    ordenamiento[ordenar] = orden === 'desc' ? -1 : 1;

    // Paginación
    const skip = (parseInt(pagina - 1) * parseInt(limite));

    // Obtener reseñas
    const reseñas = await Reseña.find(filtros)
      .sort(ordenamiento)
      .limit(parseInt(limite))
      .skip(skip)
      .populate('juegoId', 'titulo imagenPortada genero plataforma');
      
      const totalReseñas = await Reseña.countDocuments(filtros);

      res.json({
        success: true,
        data: reseñas,
        pagination: {
          totalReseñas,
          limite: parseInt(limite),
          pagina: parseInt(pagina),
          totalPaginas: Math.ceil(totalReseñas / parseInt(limite)),
        }
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reseñas',
      error: error.message,
    });
  }
});

// OBTENER UNA RESEÑA ESPECÍFICA (GET /api/reseñas/:id)
router.get('/:id', async (req, res) => {
  try {
    const reseña = await Reseña.findById(req.params.id).populate('juegoId', 'titulo imagenPortada genero plataforma desarrollador');
    if (!reseña) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada',
      });
    }

    res.json({
      success: true,
      data: reseña,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la reseña',
      error: error.message,
    });
  }
});

// OBTENER RESEÑAS DE UN JUEGO ESPECÍFICO (GET /api/reseñas/juego/:juegoId)
router.get('/juego/:juegoId', async (req, res) => {
  try {
    const {juegoId} = req.params;

    // Verificar que el juego existe
    const juego = await Juego.findById(juegoId);
    if (!juego) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado',
      });
    }

    const reseñas = await Reseña.find({juegoId})
      .populate('juegoId', 'titulo imagenPortada genero plataforma desarrollador');

      res.json({
        success: true,
        data: reseñas,
        juego: {
          id: juegoId,
          titulo: juego.titulo,
          imagenPortada: juego.imagenPortada,
          genero: juego.genero,
          plataforma: juego.plataforma,
          desarrollador: juego.desarrollador
        }
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reseñas del juego',
      error: error.message,
    });
  }
});

// CREAR NUEVA RESEÑA (POST /api/reseñas)
router.post('/', async (req, res) => {
  try {
    const {juegoId} = req.body;

    // Verificar que el juego existe
    const juego = await Juego.findById(juegoId);
    if (!juego) {
      return res.status(404).json({
        success: false,
        message: 'El juego especificado no existe',
      });
    }

    // Verificar si ya existe una reseña para este juego
    const reseñaExistente = await Reseña.findOne({juegoId});
    if (reseñaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reseñado este juego. Actualiza dicha reseña para modificarla.',
      });
    }

    const nuevaReseña = new Reseña(req.body);
    const reseñaGuardada = await nuevaReseña.save();

    // Poblar la población del juego
    await reseñaGuardada.populate('juegoId', 'titulo imagenPortada genero plataforma desarrollador');

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: reseñaGuardada,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación al crear la reseña',
        error: errores,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al crear la reseña',
      error: error.message,
    });
  }
});

// ACTUALIZAR RESEÑA EXISTENTE (PUT /api/reseñas/:id)
router.put('/:id', async (req, res) => {
  try {
    const reseñaActualizada = await Reseña.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}).populate('juegoId', 'titulo imagenPortada genero plataforma desarrollador');
    if (!reseñaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: reseñaActualizada,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación al actualizar la reseña',
        error: errores,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la reseña',
      error: error.message,
    });
  }
});

// ELIMINAR RESEÑA (DELETE /api/reseñas/:id)
router.delete('/:id', async (req, res) => {
  try {
    const reseñaEliminada = await Reseña.findById(req.params.id);
    if (!reseñaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada',
      });
    }

    await Reseña.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la reseña',
      error: error.message,
    });
  }
});

// OBTENER ESTADÍSTICAS DE RESEÑAS (GET /api/reseñas/estadisticas/resumen)
router.get('/estadisticas/resumen', async (req, res) => {
  try {
    const estadisticas = await Reseña.getEstadisticas();

    const totalReseñas = await Reseña.countDocuments();
    const reseñasRecomendadas = await Reseña.countDocuments({recomendaria: true});

    const distribucionPuntuaciones = await Reseña.aggregate([
      {$group: {_id: '$puntuacion', cantidad: {$sum: 1}}},
      {$sort: {_id: 1}}
    ]);

    const distribucionDificultad = await Reseña.aggregate([
      {$group: {_id: '$dificultad', cantidad: {$sum: 1}}},
      {$sort: {cantidad: -1}}
    ]);

    res.json({
      success: true,
      data: {
        totalReseñas,
        reseñasRecomendadas,
        porcentajeRecomendacion: totalReseñas > 0 ? Math.round((reseñasRecomendadas / totalReseñas) * 100) : 0,
        estadisticasGenerales: estadisticas[0] || {
          totalReseñas: 0,
          puntuacionPromedio: 0,
          horasPromedioJugadas: 0,
          totalHorasJugadas: 0
        },
        distribucionPuntuaciones,
        distribucionDificultad
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las estadísticas de reseñas',
      error: error.message,
    });
  }
});

module.exports = router;


