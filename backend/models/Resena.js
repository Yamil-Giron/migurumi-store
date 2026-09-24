const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  usuarioNombre: { type: String, required: true },
  calificacion: { type: Number, required: true, min: 1, max: 5 },
  titulo: { type: String, trim: true },
  comentario: { type: String, required: true, trim: true },
}, { timestamps: true });

// Un usuario solo puede dejar una reseña por producto
resenaSchema.index({ productoId: 1, usuarioId: 1 }, { unique: true });

module.exports = mongoose.model('Resena', resenaSchema);