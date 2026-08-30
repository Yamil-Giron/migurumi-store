const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    descripcion: String,
    imagenPortada: String,
    activa: { type: Boolean, default: true },
    orden: { type: Number, default: 0 },
    metaDescripcion: String,
    palabrasClaveMetatag: [String],
    fechaCreacion: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categoria', categoriaSchema);