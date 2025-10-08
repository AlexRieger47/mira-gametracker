const express = require('express');
const router = express.Router();
const Juego = require('../models/juego')
const Reseña = require('../models/reseña')

// OBTENER TODOS LOS JUEGOS (GET /api/juegos)
router.get('/', async (req, res) => {
  try {
    const {
      genero,
      plataforma,
      completado,
      buscar,
      ordenar = 'fechaCreacion',
      orden = 'desc',
      limite = 50,
      pagina = 1,
    } = req.query;

    // Filtros
    const filtros = {};

    if (genero) filtros.genero = genero;
    if (plataforma) filtros.plataforma = plataforma;
    if (completado !== undefined) filtros.completado = completado === 'true';

    // Búsqueda por título o desarrollador
    if (buscar) {
      filtros.$or = [
        { titulo: { $regex: buscar, $options: 'i' } },
        { desarrollador: { $regex: buscar, $options: 'i' } },
      ];
    }

    // Ordenamiento
    const ordenamiento = {};
    ordenamiento[ordenar] = orden === 'desc' ? -1 : 1;

    // Paginación
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    // Obtener juegos
    const juegos = await Juego.find(filtros)
      .sort(ordenamiento)
      .limit(parseInt(limite))
      .skip(skip)
      .populate('reseñas');
    
    const totalJuegos = await Juego.countDocuments(filtros);
    
    // Responder con los juegos y la información de paginación
    res.json({
      success: true,
      data: juegos,
      pagination: {
        total: totalJuegos,
        limite: parseInt(limite),
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(totalJuegos / parseInt(limite)),
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los juegos',
      error: error.message,
    });
  }
});

// OBTENER UN JUEGO ESPECÍFICO (GET /api/juegos/:id)
router.get('/:id', async (req, res) => {
  try {
    const juego = await Juego.findById(req.params.id).populate('reseñas');
    if (!juego) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: juego,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el juego',
      error: error.message,
    });
  }
});

// AGREGAR JUEGO A LA COLECCIÓN (POST /api/juegos)
router.post('/', async (req, res) => {
  try {
    const nuevoJuego = new Juego(req.body);
    const juegoGuardado = await nuevoJuego.save();

    res.json({
      success: true,
      message: 'Juego agregado exitosamente a tu biblioteca',
      data: juegoGuardado,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación al agregar el juego',
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al agregar el juego',
      error: error.message,
    });
  }
});

// ACTUALIZAR INFORMACIÓN DEL JUEGO (PUT /api/juegos/:id)
router.put('/:id', async (req, res) => {
  try {
    const juegoActualizado = await Juego.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!juegoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Juego actualizado exitosamente',
      data: juegoActualizado,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación al actualizar el juego',
        error: errores,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el juego',
      error: error.message,
    });
  }
});

// REMOVER JUEGO DE LA BIBLIOTECA (DELETE /api/juegos/:id)
router.delete('/:id', async (req, res) => {
  try {
    const juegoEliminado = await Juego.findById(req.params.id);
    if (!juegoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado',
      });
    }
    //Eliminar adicionalmente las reseñas asociadas
    await Reseña.deleteMany({ juego: juegoEliminado._id });
    //Eliminar el juego
    await Juego.findByIdAndRemove(req.params.id);

    res.json({
      success: true,
      message: 'Juego y reseñas eliminados exitosamente',
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el juego',
      error: error.message,
    });
  }
});

// OBTENER ESTADÍSTICAS DE LA BIBLIOTECA (GET /api/juegos/estadisticas/resumen)
router.get('/estadisticas/resumen', async (req, res) => {
  try {
    const totalJuegos = await Juego.countDocuments();
    const juegosCompletados = await Juego.countDocuments({ completado: true });
    const juegosPendientes = totalJuegos - juegosCompletados;

    const juegosPorGenero = await Juego.aggregate([
      {$group: {_id: '$genero', cantidad: {$sum: 1}}},
      {$sort: {cantidad: -1}},
    ]);

    const juegosPorPlataforma = await Juego.aggregate([
      {$group: {_id: '$plataforma', cantidad: {$sum: 1}}},
      {$sort: {cantidad: -1}},
    ]);

    res.json({
      success: true,
      data: {
        totalJuegos,
        juegosCompletados,
        juegosPendientes,
        porcentajeCompletado: totalJuegos > 0 ? Math.round((juegosCompletados / totalJuegos) * 100) : 0,
        distribucionGeneros: juegosPorGenero,
        distribucionPlataformas: juegosPorPlataforma
      }
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message: 'Error al obtener las estadísticas',
    error: error.message,
  });
}
});

module.exports = router;


