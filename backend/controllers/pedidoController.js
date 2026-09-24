const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

// POST /api/pedidos (cliente logueado)
exports.crearPedido = async (req, res) => {
  try {
    const { items, subtotal, costoEnvio, total } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 1) Validar stock de todos los items ANTES de descontar nada
    for (const item of items) {
      const producto = await Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: `Producto no encontrado: ${item.nombre}` });
      }

      if (item.varianteId) {
        const variante = producto.variantes.id(item.varianteId);
        if (!variante) {
          return res.status(400).json({
            error: `Variante no encontrada para ${item.nombre} (¿el producto fue editado y esa variante ya no existe?)`,
          });
        }
        if (variante.stock < item.cantidad) {
          return res.status(400).json({
            error: `Stock insuficiente para ${item.nombre} (disponible: ${variante.stock})`,
          });
        }
      } else if (producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para ${item.nombre} (disponible: ${producto.stock})`,
        });
      }
    }

    // 2) Descontar stock
    for (const item of items) {
      const producto = await Producto.findById(item.productoId);
      if (item.varianteId) {
        producto.variantes.id(item.varianteId).stock -= item.cantidad;
      } else {
        producto.stock -= item.cantidad;
      }
      await producto.save();
    }

    // 3) Crear el pedido
    const pedido = await Pedido.create({
      usuarioId: usuario._id,
      clienteNombre: usuario.nombre,
      clienteEmail: usuario.email,
      items,
      subtotal,
      costoEnvio: costoEnvio ?? 0,
      total,
    });

    res.status(201).json({ mensaje: 'Pedido realizado exitosamente', pedido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/pedidos/mios (cliente logueado)
exports.obtenerMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuarioId: req.user.id }).sort({ createdAt: -1 });
    res.json({ total: pedidos.length, pedidos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/pedidos (admin)
exports.obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json({ total: pedidos.length, pedidos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/pedidos/:id/estado (admin)
// PUT /api/pedidos/:id/estado (admin)
exports.actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { returnDocument: 'after', runValidators: true }
    );
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ mensaje: 'Pedido actualizado', pedido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};