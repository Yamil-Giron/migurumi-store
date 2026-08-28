const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    descripcion: String,
    categoriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: true,
    },
    precio: {
      type: Number,
      required: true,
    },
    precioOriginal: Number,
    descuento: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    imagenesUrl: [String],
    especificaciones: {
      altura: String,
      material: String,
      tiempoElaboracion: String,
      colores: [String],
    },
    activo: { type: Boolean, default: true },
    destacado: Boolean,
    vendedor: String,
    calificacionPromedio: { type: Number, default: 0, min: 0, max: 5 },
    numeroResenas: { type: Number, default: 0 },
    ventasTotales: { type: Number, default: 0 },
    fechaCreacion: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Producto', productoSchema);