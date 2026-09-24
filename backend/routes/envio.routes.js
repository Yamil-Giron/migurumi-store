const express = require('express');
const router = express.Router();
const controller = require('../controllers/envioController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, isAdmin, controller.crearEnvio);
router.put('/:id/estado', authenticateToken, isAdmin, controller.actualizarEstadoEnvio);
router.get('/', authenticateToken, isAdmin, controller.obtenerTodosEnvios);
router.get('/mis', authenticateToken, controller.obtenerMisEnvios);
router.get('/pedido/:pedidoId', authenticateToken, controller.obtenerPorPedido);

module.exports = router;