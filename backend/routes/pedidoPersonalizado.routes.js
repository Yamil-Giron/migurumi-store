const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidoPersonalizadoController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Público: crear pedido (opcionalmente autenticado)
router.post('/', (req, res, next) => {
  // Si viene token, lo decodifica; si no, sigue igual
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, controller.crearPedido);

// Cliente logueado: sus propios pedidos
router.get('/mios', authenticateToken, controller.obtenerMisPedidos);

// Admin: todo el resto
router.get('/', authenticateToken, isAdmin, controller.obtenerPedidos);
router.get('/:id', authenticateToken, isAdmin, controller.obtenerPedidoPorId);
router.put('/:id', authenticateToken, isAdmin, controller.actualizarPedido);
router.delete('/:id', authenticateToken, isAdmin, controller.eliminarPedido);

module.exports = router;