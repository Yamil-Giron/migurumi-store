const PedidoPersonalizado = require('../models/PedidoPersonalizado');

// POST /api/pedidos-personalizados (público)
exports.crearPedido = async (req, res) => {
  try {
    const {
      cliente,
      descripcion,
      colores,
      tamanos,
      cantidad,
      imagenesReferencia,
      presupuestoCliente,
      envio,
    } = req.body;

    if (!cliente?.nombre || !cliente?.email || !descripcion) {
      return res.status(400).json({
        error: 'Nombre, email y descripción son requeridos',
      });
    }

    const pedido = new PedidoPersonalizado({
      cliente,
      descripcion,
      colores: colores ?? [],
      tamanos: tamanos ?? [],
      cantidad: cantidad ?? 1,
      imagenesReferencia: imagenesReferencia ?? [],
      presupuestoCliente,
      envio: envio ?? { tipo: 'cotizar' },
      usuarioId: req.user?.id ?? undefined,
    });

    await pedido.save();

    res.status(201).json({
      mensaje: 'Pedido personalizado creado exitosamente',
      pedido,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/pedidos-personalizados (admin)
exports.obtenerPedidos = async (req, res) => {
  try {
    const { estado, buscar } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (buscar) {
      filtro.$or = [
        { numeroPedido: { $regex: buscar, $options: 'i' } },
        { 'cliente.nombre': { $regex: buscar, $options: 'i' } },
        { 'cliente.email': { $regex: buscar, $options: 'i' } },
        { descripcion: { $regex: buscar, $options: 'i' } },
      ];
    }

    const pedidos = await PedidoPersonalizado.find(filtro).sort({
      createdAt: -1,
    });

    res.json({
      total: pedidos.length,
      pedidos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/pedidos-personalizados/mios (cliente logueado)
exports.obtenerMisPedidos = async (req, res) => {
  try {
    const pedidos = await PedidoPersonalizado.find({
      usuarioId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({ total: pedidos.length, pedidos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/pedidos-personalizados/:id (admin)
exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await PedidoPersonalizado.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ pedido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/pedidos-personalizados/:id (admin)
exports.actualizarPedido = async (req, res) => {
  try {
    const datos = { ...req.body };

    // Si se manda cotización, agregar fecha automáticamente
    if (datos.cotizacion?.precio) {
      datos.cotizacion.fechaCotizacion = new Date();
      // Si estaba pendiente, pasa a "cotizado"
      if (!datos.estado) datos.estado = 'cotizado';
    }

    const pedido = await PedidoPersonalizado.findByIdAndUpdate(
      req.params.id,
      datos,
      { returnDocument: 'after', runValidators: true }
    );

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Pedido actualizado', pedido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/pedidos-personalizados/:id (admin)
exports.eliminarPedido = async (req, res) => {
  try {
    const pedido = await PedidoPersonalizado.findByIdAndDelete(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Pedido eliminado', pedido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};