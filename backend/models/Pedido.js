const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  varianteId: { type: mongoose.Schema.Types.ObjectId, default: null },
  nombre: { type: String, required: true },
  precioUnitario: { type: Number, required: true },
  cantidad: { type: Number, required: true, min: 1 },
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  numeroPedido: { type: String, unique: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  clienteNombre: { type: String, required: true },
  clienteEmail: { type: String, required: true },
  items: { type: [itemPedidoSchema], required: true },
  subtotal: { type: Number, required: true },
  costoEnvio: { type: Number, default: 0 },
  total: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente',
  },
}, { timestamps: true });

pedidoSchema.pre('save', async function () {
  if (this.isNew && !this.numeroPedido) {
    const count = await mongoose.model('Pedido').countDocuments();
    this.numeroPedido = `PED-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Pedido', pedidoSchema);