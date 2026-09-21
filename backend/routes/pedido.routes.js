const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidoController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, controller.crearPedido);
router.get('/mios', authenticateToken, controller.obtenerMisPedidos);
router.get('/', authenticateToken, isAdmin, controller.obtenerPedidos);
router.put('/:id/estado', authenticateToken, isAdmin, controller.actualizarEstado);

module.exports = router;