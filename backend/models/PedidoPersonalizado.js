const mongoose = require('mongoose');

const pedidoPersonalizadoSchema = new mongoose.Schema(
  {
    numeroPedido: {
      type: String,
      unique: true,
      index: true,
    },
    cliente: {
      nombre: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      telefono: { type: String, trim: true },
    },
    descripcion: { type: String, required: true, trim: true },
    colores: { type: [String], default: [] },
    tamanos: { type: [String], default: [] },
    cantidad: { type: Number, default: 1, min: 1 },
    imagenesReferencia: { type: [String], default: [] },
    presupuestoCliente: Number,
    envio: {
      tipo: {
        type: String,
        enum: ['cotizar', 'retiro', 'domicilio'],
        default: 'cotizar',
      },
      direccion: {
        calle: String,
        ciudad: String,
        region: String,
        codigoPostal: String,
        pais: { type: String, default: 'Chile' },
      },
      costo: Number,
    },
    estado: {
      type: String,
      enum: [
        'pendiente',
        'cotizado',
        'aprobado',
        'en_produccion',
        'enviado',
        'entregado',
        'cancelado',
      ],
      default: 'pendiente',
    },
    cotizacion: {
      precio: Number,
      tiempoEstimado: String,
      notas: String,
      fechaCotizacion: Date,
    },
    notasAdmin: String,
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

// Autogenerar número de pedido tipo PP-0001
pedidoPersonalizadoSchema.pre('save', async function () {
  if (this.isNew && !this.numeroPedido) {
    const count = await mongoose
      .model('PedidoPersonalizado')
      .countDocuments();
    this.numeroPedido = `PP-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model(
  'PedidoPersonalizado',
  pedidoPersonalizadoSchema
);