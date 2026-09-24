const Envio = require('../models/Envio');
const Pedido = require('../models/Pedido');

// POST /api/envios (admin) — crea el envío para un pedido
exports.crearEnvio = async (req, res) => {
  try {
    const { pedidoId, transportista, numeroSeguimiento } = req.body;

    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const existente = await Envio.findOne({ pedidoId });
    if (existente) {
      return res.status(409).json({ error: 'Este pedido ya tiene un envío asociado' });
    }

    const envio = await Envio.create({
      pedidoId,
      usuarioId: pedido.usuarioId,
      transportista,
      numeroSeguimiento,
      estado: 'despachado',
      fechaDespacho: new Date(),
      historialSeguimiento: [{ estado: 'despachado', comentario: 'Envío generado' }],
    });

    pedido.estado = 'enviado';
    await pedido.save();

    res.status(201).json({ mensaje: 'Envío creado', envio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/envios/:id/estado (admin)
exports.actualizarEstadoEnvio = async (req, res) => {
  try {
    const { estado, comentario } = req.body;
    const envio = await Envio.findById(req.params.id);
    if (!envio) return res.status(404).json({ error: 'Envío no encontrado' });

    envio.estado = estado;
    envio.historialSeguimiento.push({ estado, comentario });
    if (estado === 'entregado') envio.fechaEntrega = new Date();
    await envio.save();

    if (estado === 'entregado') {
      await Pedido.findByIdAndUpdate(envio.pedidoId, { estado: 'entregado' });
    }

    res.json({ mensaje: 'Envío actualizado', envio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/envios/pedido/:pedidoId (cliente o admin)
exports.obtenerPorPedido = async (req, res) => {
  try {
    const envio = await Envio.findOne({ pedidoId: req.params.pedidoId });
    if (!envio) return res.status(404).json({ error: 'Sin envío asociado aún' });
    res.json({ envio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/envios/mis (cliente) — todos los envíos del usuario logueado
exports.obtenerMisEnvios = async (req, res) => {
  try {
    const envios = await Envio.find({ usuarioId: req.user.id });
    res.json({ envios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerTodosEnvios = async (req, res) => {
  try {
    const envios = await Envio.find();
    res.json({ envios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};