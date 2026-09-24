const mongoose = require('mongoose');
const Resena = require('../models/Resena');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

async function actualizarPromedio(productoId) {
  const stats = await Resena.aggregate([
    { $match: { productoId: new mongoose.Types.ObjectId(productoId) } },
    { $group: { _id: '$productoId', promedio: { $avg: '$calificacion' } } },
  ]);
  const promedio = stats[0]?.promedio ?? 0;
  await Producto.findByIdAndUpdate(productoId, {
    calificacionPromedio: Math.round(promedio * 10) / 10,
  });
}

// POST /api/resenas (cliente logueado)
exports.crearResena = async (req, res) => {
  try {
    const { productoId, calificacion, titulo, comentario } = req.body;

    if (!productoId || !calificacion || !comentario) {
      return res.status(400).json({ error: 'Faltan datos de la reseña' });
    }

    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const resena = await Resena.create({
      productoId,
      usuarioId: usuario._id,
      usuarioNombre: usuario.nombre,
      calificacion,
      titulo,
      comentario,
    });

    await actualizarPromedio(productoId);

    res.status(201).json({ mensaje: 'Reseña publicada', resena });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Ya dejaste una reseña para este producto' });
    }
    res.status(500).json({ error: error.message });
  }
};

// GET /api/resenas/producto/:productoId (público)
exports.obtenerPorProducto = async (req, res) => {
  try {
    const resenas = await Resena.find({ productoId: req.params.productoId }).sort({
      createdAt: -1,
    });
    res.json({ total: resenas.length, resenas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/resenas/:id (admin, moderación)
exports.eliminarResena = async (req, res) => {
  try {
    const resena = await Resena.findByIdAndDelete(req.params.id);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });
    await actualizarPromedio(resena.productoId);
    res.json({ mensaje: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};