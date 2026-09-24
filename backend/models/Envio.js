const mongoose = require('mongoose');

const envioSchema = new mongoose.Schema({
  pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true, unique: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  transportista: { type: String, required: true },
  numeroSeguimiento: { type: String, required: true },
  estado: {
    type: String,
    enum: ['preparando', 'despachado', 'en_transito', 'entregado'],
    default: 'preparando',
  },
  fechaDespacho: { type: Date, default: null },
  fechaEntrega: { type: Date, default: null },
  historialSeguimiento: [
    {
      estado: String,
      fecha: { type: Date, default: Date.now },
      comentario: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Envio', envioSchema);